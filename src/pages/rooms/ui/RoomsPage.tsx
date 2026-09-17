import { IconPlusLine } from "@karrotmarket/react-monochrome-icon";
import { PrefixIcon } from "@seed-design/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { RoomStatusBadge, rooms, type RoomStatus } from "@/entities/room";
import { MetricCard, PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function RoomsPage({ state }: { state: ViewState }) {
  const [status, setStatus] = useState<"ALL" | RoomStatus>("ALL");
  const filtered = status === "ALL" ? rooms : rooms.filter((room) => room.status === status);
  return <><PageTitle eyebrow="건물 관리" title="호실 현황" description="층별 입주 상태와 초대 현황을 확인하세요." action={<ActionButton variant="brandSolid"><PrefixIcon svg={<IconPlusLine />} />호실 추가</ActionButton>} />
    <section className="metrics-grid metrics-grid--three"><MetricCard label="입주" value={3} /><MetricCard label="초대됨" value={1} /><MetricCard label="공실" value={2} /></section>
    <div className="filter-bar"><SegmentedControl aria-label="호실 상태" value={status} onValueChange={(value) => setStatus(value as typeof status)}><SegmentedControlItem value="ALL">전체</SegmentedControlItem><SegmentedControlItem value="LIVING">입주</SegmentedControlItem><SegmentedControlItem value="INVITED">초대됨</SegmentedControlItem><SegmentedControlItem value="EMPTY">공실</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state} emptyTitle="조건에 맞는 호실이 없어요"><section className="room-grid">{filtered.map((room) => <Link className="room-card" to={`/manager/rooms/${room.id}`} key={room.id}><div><strong>{room.roomNo}</strong><RoomStatusBadge status={room.status} /></div><p>{room.resident ?? (room.status === "INVITED" ? "초대 응답 대기 중" : "입주민 없음")}</p><span>누적 민원 {room.complaints}건</span></Link>)}</section></StateBoundary>
  </>;
}
