import { IconBellLine } from '@karrotmarket/react-monochrome-icon';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { useNotificationCount } from '@/entities/notification';
import { useNotificationSession } from '@/features/notification-sync';
import type { RouteRole } from '@/shared/config';

export function NotificationBell({ role }: { role: RouteRole }) {
  const { userId } = useNotificationSession();
  const count = useNotificationCount(userId);
  const unread = count.isError ? undefined : count.data?.unreadCount;
  return (
    <Link
      to={`/${role}/notifications`}
      className="notification-bell"
      aria-label={
        unread === undefined
          ? '알림, 미읽음 수 확인 불가'
          : `알림, 읽지 않은 알림 ${unread}개`
      }
    >
      <IconBellLine aria-hidden="true" />
      {unread !== undefined && unread > 0 && (
        <span className="notification-count" aria-hidden="true">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
export function NotificationConnectionNotice() {
  const { userId, status, retry } = useNotificationSession();
  if (userId === null || status === 'connected' || status === 'connecting')
    return null;
  return (
    <div className="notification-connection" role="status">
      <span>
        {status === 'reconnecting'
          ? '실시간 알림 연결이 끊겼어요. 다시 연결하고 있어요.'
          : '실시간 알림에 연결할 수 없어요. 알림 목록을 새로고침하거나 다시 연결해 주세요.'}
      </span>
      <ActionButton variant="ghost" size="small" onClick={retry}>
        다시 연결
      </ActionButton>
    </div>
  );
}
