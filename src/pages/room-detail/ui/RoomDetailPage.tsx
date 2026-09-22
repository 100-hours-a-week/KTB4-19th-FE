import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import {
  RoomStatusBadge,
  roomApi,
  roomKeys,
  roomStatusMeta,
  useManagerRooms,
  type InvitationCodeResponse,
  type RoomListItem,
  type RoomStatus,
} from '@/entities/room';
import { isApiError } from '@/shared/api';
import { formatRoomNo } from '@/shared/lib';
import { InfoRow, PageTitle, StateBoundary } from '@/shared/ui';

export function RoomDetailPage() {
  const { roomId: rawRoomId } = useParams();
  const roomId = Number(rawRoomId);
  const roomsQuery = useManagerRooms();
  const room = roomsQuery.data?.rooms.find(
    (candidate) => candidate.roomId === roomId,
  );

  if (!Number.isInteger(roomId) || roomId < 1) return <RoomUnavailable />;
  if (roomsQuery.isPending)
    return (
      <StateBoundary state="loading">
        <></>
      </StateBoundary>
    );
  if (roomsQuery.isError)
    return (
      <StateBoundary state="error" onRetry={() => roomsQuery.refetch()}>
        <></>
      </StateBoundary>
    );
  if (!room) return <RoomUnavailable />;
  return (
    <RoomDetail
      key={room.roomId}
      buildingName={roomsQuery.data.buildingName}
      room={room}
    />
  );
}

function RoomDetail({
  buildingName,
  room,
}: {
  buildingName: string | null;
  room: RoomListItem;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RoomStatus>(room.roomStatus);
  const [invitation, setInvitation] = useState<InvitationCodeResponse | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshRoomQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: roomKeys.list() }),
      queryClient.invalidateQueries({ queryKey: roomKeys.summary() }),
    ]);

  const issueInvitation = async () => {
    setPending(true);
    setErrorMessage(null);
    try {
      const result = await roomApi.issueInvitation(room.roomId);
      setInvitation(result);
      setStatus(result.roomStatus);
      setCopied(false);
      await refreshRoomQueries();
    } catch (error) {
      setErrorMessage(roomActionError(error, '초대코드를 발급하지 못했어요.'));
    } finally {
      setPending(false);
    }
  };

  const cancelInvitation = async () => {
    if (!invitation) return;
    setPending(true);
    setErrorMessage(null);
    try {
      await roomApi.cancelInvitation(room.roomId, invitation.codeId);
      setInvitation(null);
      setStatus('EMPTY');
      await refreshRoomQueries();
    } catch (error) {
      setErrorMessage(roomActionError(error, '초대코드를 취소하지 못했어요.'));
    } finally {
      setPending(false);
    }
  };

  const moveOut = async () => {
    setPending(true);
    setErrorMessage(null);
    try {
      await roomApi.moveOutResident(room.roomId);
      setInvitation(null);
      setStatus('EMPTY');
      await refreshRoomQueries();
    } catch (error) {
      setErrorMessage(
        roomActionError(error, '입주민을 퇴실 처리하지 못했어요.'),
      );
    } finally {
      setPending(false);
    }
  };

  const copyCode = async () => {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.code);
      setCopied(true);
    } catch {
      setErrorMessage(
        '초대코드를 복사하지 못했어요. 코드를 직접 입력해 주세요.',
      );
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="호실 상세"
        title={formatRoomNo(room.roomNo)}
        description={buildingName ?? '관리 건물'}
      />
      <div className="detail-grid">
        <section className="panel">
          {errorMessage && (
            <Callout tone="critical" description={errorMessage} />
          )}
          <div className="detail-status">
            <div>
              <span>현재 상태</span>
              <h2>{roomStatusMeta[status].label}</h2>
            </div>
            <RoomStatusBadge status={status} />
          </div>
          {status === 'EMPTY' && (
            <div className="empty-room">
              <span className="large-symbol">
                {formatRoomNo(room.roomNo).replace('호', '')}
              </span>
              <h3>현재 입주민이 없어요</h3>
              <p>새 입주민을 초대할 코드를 발급해 보세요.</p>
              <ActionButton
                variant="brandSolid"
                loading={pending}
                disabled={pending}
                onClick={issueInvitation}
              >
                초대코드 발급
              </ActionButton>
            </div>
          )}
          {status === 'INVITED' && (
            <div className="invitation-card">
              <span>입주민 초대코드</span>
              {invitation ? (
                <>
                  <strong>{invitation.code}</strong>
                  <p>
                    {formatRoomNo(invitation.roomNo)} ·{' '}
                    {formatExpiry(invitation.expiresAt)}까지
                  </p>
                </>
              ) : (
                <p>최신 초대코드를 발급해 주세요.</p>
              )}
              <div className="button-row">
                <ActionButton
                  variant="brandSolid"
                  loading={pending}
                  disabled={pending || !invitation}
                  onClick={copyCode}
                >
                  {copied ? '복사됨' : '코드 복사'}
                </ActionButton>
                <ActionButton
                  variant="neutralOutline"
                  loading={pending}
                  disabled={pending}
                  onClick={issueInvitation}
                >
                  재발급
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  color="fg.critical"
                  disabled={pending || !invitation}
                  onClick={cancelInvitation}
                >
                  초대 취소
                </ActionButton>
              </div>
            </div>
          )}
          {status === 'LIVING' && (
            <div className="resident-card">
              <span className="avatar avatar--large">
                {room.residentName?.slice(0, 1) ?? '입'}
              </span>
              <div>
                <h3>{room.residentName ?? '입주민'}</h3>
                <p>연결된 입주민</p>
                <small>현재 거주 중</small>
              </div>
              <ActionButton
                variant="neutralOutline"
                loading={pending}
                disabled={pending}
                onClick={moveOut}
              >
                입주민 퇴실
              </ActionButton>
            </div>
          )}
        </section>
        <aside className="panel detail-aside">
          <h2>호실 정보</h2>
          <InfoRow label="건물" value={buildingName ?? '관리 건물'} />
          <InfoRow label="호실" value={formatRoomNo(room.roomNo)} />
        </aside>
      </div>
    </>
  );
}

function RoomUnavailable() {
  return (
    <div className="result-state">
      <h2>호실을 찾을 수 없어요</h2>
      <p>호실 목록에서 다시 선택해 주세요.</p>
      <Link className="text-link" to="/manager/rooms">
        호실 목록으로 돌아가기
      </Link>
    </div>
  );
}

function formatExpiry(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

function roomActionError(error: unknown, fallback: string) {
  if (!isApiError(error)) return fallback;
  if (error.status === 401)
    return '로그인 정보가 만료됐어요. 다시 로그인해 주세요.';
  if (error.status === 403) return '담당 건물의 호실만 변경할 수 있어요.';
  if (error.status === 404) return '호실 또는 초대코드를 찾을 수 없어요.';
  if (error.status === 409)
    return error.message || '현재 호실 상태에서는 처리할 수 없어요.';
  return error.message || fallback;
}
