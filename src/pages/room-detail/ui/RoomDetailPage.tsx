import { useState } from "react";
import { useParams } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { RoomStatusBadge, roomStatusMeta, rooms, type RoomStatus } from "@/entities/room";
import { InfoRow, PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function RoomDetailPage({ state }: { state: ViewState }) {
  const { roomId } = useParams();
  const initial = rooms.find((room) => String(room.id) === roomId) ?? rooms[0];
  const [status, setStatus] = useState<RoomStatus>(initial.status);
  return <><PageTitle eyebrow="호실 상세" title={initial.roomNo} description="A타워 · 3층" />
    <div className="filter-bar filter-bar--left"><span>프로토타입 상태</span><SegmentedControl aria-label="호실 도메인 상태" value={status} onValueChange={(value) => setStatus(value as RoomStatus)}><SegmentedControlItem value="EMPTY">EMPTY</SegmentedControlItem><SegmentedControlItem value="INVITED">INVITED</SegmentedControlItem><SegmentedControlItem value="LIVING">LIVING</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state}><div className="detail-grid"><section className="panel"><div className="detail-status"><div><span>현재 상태</span><h2>{roomStatusMeta[status].label}</h2></div><RoomStatusBadge status={status} /></div>{status === "EMPTY" && <div className="empty-room"><span className="large-symbol">301</span><h3>현재 입주민이 없어요</h3><p>새 입주민을 초대할 코드를 발급해 보세요.</p><ActionButton variant="brandSolid">초대코드 발급</ActionButton></div>}{status === "INVITED" && <div className="invitation-card"><span>입주민 초대코드</span><strong>K7M9XZ</strong><p>2026년 9월 21일 23:59까지</p><div className="button-row"><ActionButton variant="brandSolid">코드 복사</ActionButton><ActionButton variant="neutralOutline">재발급</ActionButton><ActionButton variant="ghost" color="fg.critical">초대 취소</ActionButton></div></div>}{status === "LIVING" && <div className="resident-card"><span className="avatar avatar--large">박</span><div><h3>박입주</h3><p>010-9876-5432</p><small>2026년 8월 21일부터 입주</small></div><ActionButton variant="neutralOutline">입주민 퇴실</ActionButton></div>}</section><aside className="panel detail-aside"><h2>호실 정보</h2><InfoRow label="건물" value="A타워" /><InfoRow label="호실" value={initial.roomNo} /><InfoRow label="누적 민원" value={`${status === "LIVING" ? 3 : 0}건`} /><InfoRow label="마지막 변경" value="오늘 10:42" /></aside></div></StateBoundary>
  </>;
}
