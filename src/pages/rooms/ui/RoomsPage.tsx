import { IconPlusLine } from '@karrotmarket/react-monochrome-icon';
import { PrefixIcon } from '@seed-design/react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import {
  SegmentedControl,
  SegmentedControlItem,
} from 'seed-design/ui/segmented-control';
import {
  RoomStatusBadge,
  useManagerRooms,
  useManagerRoomSummary,
  type RoomStatus,
} from '@/entities/room';
import { formatRoomNo } from '@/shared/lib';
import { MetricCard, PageTitle, StateBoundary } from '@/shared/ui';

export function RoomsPage() {
  const [searchParams] = useSearchParams();
  const buildingId = Number(searchParams.get('buildingId'));
  const hasBuildingId = Number.isInteger(buildingId) && buildingId > 0;
  const roomsQuery = useManagerRooms(buildingId);
  const summaryQuery = useManagerRoomSummary(buildingId);
  const [status, setStatus] = useState<'ALL' | RoomStatus>('ALL');
  const rooms = roomsQuery.data?.rooms ?? [];
  const filtered =
    status === 'ALL'
      ? rooms
      : rooms.filter((room) => room.roomStatus === status);
  const viewState = !hasBuildingId
    ? 'error'
    : roomsQuery.isPending
      ? 'loading'
      : roomsQuery.isError
        ? 'error'
        : filtered.length
          ? 'default'
          : 'empty';
  const summary = summaryQuery.data;

  if (!hasBuildingId) return <BuildingIdRequired />;

  return (
    <>
      <PageTitle
        eyebrow="건물 관리"
        title="호실 현황"
        description="층별 입주 상태와 초대 현황을 확인하세요."
        action={
          <ActionButton variant="brandSolid">
            <PrefixIcon svg={<IconPlusLine />} />
            호실 추가
          </ActionButton>
        }
      />
      <section className="metrics-grid metrics-grid--three">
        <MetricCard label="입주" value={summary?.livingCount ?? '—'} />
        <MetricCard label="초대됨" value={summary?.invitedCount ?? '—'} />
        <MetricCard label="공실" value={summary?.emptyCount ?? '—'} />
      </section>
      <div className="filter-bar">
        <SegmentedControl
          aria-label="호실 상태"
          value={status}
          onValueChange={(value) => setStatus(value as typeof status)}
        >
          <SegmentedControlItem value="ALL">전체</SegmentedControlItem>
          <SegmentedControlItem value="LIVING">입주</SegmentedControlItem>
          <SegmentedControlItem value="INVITED">초대됨</SegmentedControlItem>
          <SegmentedControlItem value="EMPTY">공실</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <StateBoundary
        state={viewState}
        onRetry={() => roomsQuery.refetch()}
        emptyTitle="조건에 맞는 호실이 없어요"
      >
        <section className="room-grid">
          {filtered.map((room) => (
            <Link
              className="room-card"
              to={`/manager/rooms/${room.roomId}?buildingId=${buildingId}`}
              key={room.roomId}
            >
              <div>
                <strong>{formatRoomNo(room.roomNo)}</strong>
                <RoomStatusBadge status={room.roomStatus} />
              </div>
              <p>
                {room.residentName ??
                  (room.roomStatus === 'INVITED'
                    ? '초대 응답 대기 중'
                    : '입주민 없음')}
              </p>
            </Link>
          ))}
        </section>
      </StateBoundary>
    </>
  );
}

function BuildingIdRequired() {
  return (
    <div className="result-state">
      <h2>건물 정보가 필요해요</h2>
      <p>관리할 건물의 buildingId가 포함된 화면에서 다시 들어와 주세요.</p>
      <Link className="text-link" to="/manager/building/new">
        건물 등록으로 이동
      </Link>
    </div>
  );
}
