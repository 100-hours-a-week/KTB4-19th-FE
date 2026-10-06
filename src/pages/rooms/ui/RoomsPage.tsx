import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BuildingRequired } from '@/entities/building';
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
import { isApiError } from '@/shared/api';
import { formatRoomNo } from '@/shared/lib';
import { MetricCard, PageTitle, StateBoundary } from '@/shared/ui';
import { groupRoomsByFloor, visibleRooms } from '../lib/visibleRooms.mjs';

export function RoomsPage() {
  const roomsQuery = useManagerRooms();
  const summaryQuery = useManagerRoomSummary();
  const [status, setStatus] = useState<'ALL' | RoomStatus>('ALL');
  const rooms = roomsQuery.data?.rooms ?? [];
  const filtered = visibleRooms(rooms, status);
  const floors = groupRoomsByFloor(filtered);
  const viewState = roomsQuery.isPending
    ? 'loading'
    : roomsQuery.isError
      ? 'error'
      : filtered.length
        ? 'default'
        : 'empty';
  const summary = summaryQuery.data;

  if (isApiError(roomsQuery.error) && roomsQuery.error.status === 404)
    return <BuildingRequired />;

  return (
    <>
      <PageTitle
        eyebrow="건물 관리"
        title="호실 현황"
        description="층별 입주 상태와 초대 현황을 확인하세요."
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
        <div className="room-floor-list">
          {floors.map(({ floor, rooms: floorRooms }) => (
            <section
              key={floor ?? 'other'}
              aria-labelledby={`room-floor-${floor ?? 'other'}`}
            >
              <div className="section-heading">
                <h2 id={`room-floor-${floor ?? 'other'}`}>
                  {floor === null ? '기타 호실' : `${floor}층`}
                </h2>
              </div>
              <div className="room-grid">
                {floorRooms.map((room) => (
                  <Link
                    className="room-card"
                    to={`/manager/rooms/${room.roomId}`}
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
              </div>
            </section>
          ))}
        </div>
      </StateBoundary>
    </>
  );
}
