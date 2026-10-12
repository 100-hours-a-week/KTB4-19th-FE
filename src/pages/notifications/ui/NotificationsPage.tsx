import { IconBellLine } from '@karrotmarket/react-monochrome-icon';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import {
  markNotificationRead,
  notificationKeys,
  useNotificationList,
  type Notification,
  type NotificationData,
} from '@/entities/notification';
import { useNotificationSession } from '@/features/notification-sync';
import { tokenStore } from '@/shared/api';
import type { RouteRole } from '@/shared/config';
import { formatListTime, formatRoomNo } from '@/shared/lib';
import { PageTitle, StateBoundary } from '@/shared/ui';

const statusLabels = {
  PENDING: '처리전',
  IN_PROGRESS: '처리중',
  DONE: '처리완료',
};
export function NotificationsPage({ role }: { role: RouteRole }) {
  const { userId, refresh } = useNotificationSession();
  const query = useNotificationList(userId);
  const seen = new Set<number>();
  const items =
    query.data?.pages
      .flatMap((page) => page.notifications)
      .filter((item) => {
        if (seen.has(item.userNotiId)) return false;
        seen.add(item.userNotiId);
        return true;
      }) ?? [];
  const state = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length
        ? 'default'
        : 'empty';
  return (
    <>
      <PageTitle
        eyebrow="새 소식"
        title="알림"
        description="민원 접수와 처리 상태의 변화를 알려드려요."
        action={
          <ActionButton variant="ghost" onClick={refresh}>
            새로고침
          </ActionButton>
        }
      />
      <section className="panel list-panel">
        <StateBoundary
          state={state}
          emptyTitle="새 알림이 없어요"
          onRetry={refresh}
        >
          <div className="list-stack">
            {items.map((item) => (
              <NotificationRow
                key={item.userNotiId}
                item={item}
                role={role}
                userId={userId!}
              />
            ))}
          </div>
          {query.hasNextPage && (
            <ActionButton
              variant="neutralOutline"
              disabled={query.isFetching}
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              더 보기
            </ActionButton>
          )}
        </StateBoundary>
      </section>
    </>
  );
}
function NotificationRow({
  item,
  role,
  userId,
}: {
  item: Notification;
  role: RouteRole;
  userId: number;
}) {
  const client = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [requests] = useState(() => new Set<AbortController>());
  useEffect(() => {
    const abort = () => {
      requests.forEach((request) => request.abort());
      requests.clear();
    };
    const unsubscribe = tokenStore.subscribe((token) => {
      if (token === null) abort();
    });
    return () => {
      unsubscribe();
      abort();
    };
  }, [requests]);
  const read = async () => {
    if (pending || item.readAt !== null) return;
    const controller = new AbortController();
    requests.add(controller);
    setPending(true);
    setError(false);
    try {
      const result = await markNotificationRead(
        item.userNotiId,
        controller.signal,
      );
      if (controller.signal.aborted || !tokenStore.get()) return;
      await client.cancelQueries({
        queryKey: notificationKeys.account(userId),
      });
      if (controller.signal.aborted || !tokenStore.get()) return;
      client.setQueryData<NotificationData>(
        notificationKeys.list(userId),
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((row) =>
                row.userNotiId === result.userNotiId
                  ? { ...row, readAt: result.readAt }
                  : row,
              ),
            })),
          },
      );
      client.setQueryData(notificationKeys.count(userId), {
        unreadCount: result.unreadCount,
      });
      void client.invalidateQueries({
        queryKey: notificationKeys.account(userId),
      });
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      requests.delete(controller);
      if (!controller.signal.aborted) setPending(false);
    }
  };
  const content = item.content;
  return (
    <div className={`notification-row ${item.readAt === null ? 'unread' : ''}`}>
      <span className="notification-icon">
        <IconBellLine aria-hidden="true" />
      </span>
      <div>
        <Link to={`/${role}/complaints/${content.complaintId}`}>
          <strong>
            {content.type === 'COMPLAINT_CREATED'
              ? '신규 민원이 접수됐어요'
              : '민원 상태가 변경됐어요'}
          </strong>
          <p>
            {content.type === 'COMPLAINT_CREATED'
              ? `${formatRoomNo(content.roomNo)} · ${content.title}`
              : `${content.title} · ${statusLabels[content.statusCode]}`}
          </p>
        </Link>
        <small>{formatListTime(item.createdAt)}</small>
        {error && (
          <p role="alert">읽음 처리에 실패했어요. 다시 시도해 주세요.</p>
        )}
      </div>
      {item.readAt === null ? (
        <>
          <span className="unread-dot" aria-label="읽지 않음" />
          <ActionButton
            variant="ghost"
            size="small"
            disabled={pending}
            loading={pending}
            onClick={() => void read()}
            aria-label={`${content.title} 알림 읽음 처리`}
          >
            읽음
          </ActionButton>
        </>
      ) : (
        <small>읽음</small>
      )}
    </div>
  );
}
