import { IconChevronRightLine, IconSparkle2Line } from "@karrotmarket/react-monochrome-icon";
import { Badge } from "@seed-design/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { ComplaintStatusBadge, type ComplaintStatus } from "@/entities/complaint";
import type { RouteRole } from "@/shared/config";
import { InfoRow, PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function ComplaintDetailPage({ state, role }: { state: ViewState; role: RouteRole }) {
  const [status, setStatus] = useState<ComplaintStatus>("IN_PROGRESS");
  return <><PageTitle eyebrow={`${role === "manager" ? "민원 관리" : "나의 민원"} · #77`} title="천장 누수" description="A타워 302호 · 오늘 09:20 접수" action={role === "manager" ? <ActionButton variant="neutralOutline" onClick={() => setStatus(status === "PENDING" ? "IN_PROGRESS" : "DONE")} disabled={status === "DONE"}>{status === "PENDING" ? "처리 시작" : status === "IN_PROGRESS" ? "처리 완료" : "완료된 민원"}</ActionButton> : undefined} />
    <div className="filter-bar filter-bar--left"><span>프로토타입 상태</span><SegmentedControl aria-label="민원 도메인 상태" value={status} onValueChange={(value) => setStatus(value as ComplaintStatus)}><SegmentedControlItem value="PENDING">PENDING</SegmentedControlItem><SegmentedControlItem value="IN_PROGRESS">IN_PROGRESS</SegmentedControlItem><SegmentedControlItem value="DONE">DONE</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state}><div className="detail-grid"><section className="panel complaint-detail"><div className="complaint-heading"><ComplaintStatusBadge status={status} />{role === "manager" && <Badge tone="critical" variant="weak">긴급도 9</Badge>}</div><section><h2>AI 요약</h2><div className="summary-box"><IconSparkle2Line /><p>안방 천장 가운데에서 어제 저녁부터 물이 떨어지기 시작했고, 오늘 아침부터 증상이 심해졌어요.</p></div></section><section><h2>발생 정보</h2><InfoRow label="위치" value="302호 안방 천장" /><InfoRow label="시점" value="어제 저녁부터" /><InfoRow label="증상" value="천장 가운데에서 물이 떨어짐" /></section><section><h2>첨부 사진</h2><div className="photo-placeholder"><span>누수 사진</span><small>leak.jpg · 240 KB</small></div></section></section><aside className="panel detail-aside"><h2>처리 정보</h2><InfoRow label="접수일" value="2026. 09. 14 09:20" /><InfoRow label="완료일" value={status === "DONE" ? "2026. 09. 14 14:02" : "-"} />{role === "manager" && <Link className="text-link" to="/manager/conversations/31">AI 대화 원본 보기 <IconChevronRightLine /></Link>}{role === "resident" && <Link className="text-link" to="/resident/conversations/31">접수 대화 보기 <IconChevronRightLine /></Link>}</aside></div></StateBoundary>
  </>;
}
