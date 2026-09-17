import { IconChevronRightLine, IconMagnifyingglassLine } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ComplaintStatusBadge, complaints, type ComplaintStatus } from "@/entities/complaint";
import type { RouteRole } from "@/shared/config";
import { MetricCard, PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function ComplaintsPage({ state, role }: { state: ViewState; role: RouteRole }) {
  const [status, setStatus] = useState<"ALL" | ComplaintStatus>("ALL");
  const filtered = status === "ALL" ? complaints : complaints.filter((item) => item.status === status);
  return <><PageTitle eyebrow={role === "manager" ? "민원 관리" : "나의 민원"} title={role === "manager" ? "민원 목록" : "접수한 민원"} description={role === "manager" ? "긴급도와 처리 상태를 기준으로 빠르게 대응하세요." : "접수한 민원의 처리 상태를 확인하세요."} />
    {role === "manager" && <section className="metrics-grid metrics-grid--three"><MetricCard label="처리 전" value={5} /><MetricCard label="처리 중" value={8} /><MetricCard label="이번 주 완료" value={12} /></section>}
    <section className="panel list-panel"><div className="list-tools"><TextField prefixIcon={<IconMagnifyingglassLine />}><TextFieldInput aria-label="민원 검색" placeholder="제목이나 호실로 검색" /></TextField><SegmentedControl aria-label="민원 처리 상태" value={status} onValueChange={(value) => setStatus(value as typeof status)}><SegmentedControlItem value="ALL">전체</SegmentedControlItem><SegmentedControlItem value="PENDING">처리전</SegmentedControlItem><SegmentedControlItem value="IN_PROGRESS">처리중</SegmentedControlItem><SegmentedControlItem value="DONE">완료</SegmentedControlItem></SegmentedControl></div><StateBoundary state={state} emptyTitle="조건에 맞는 민원이 없어요"><div className="list-stack">{filtered.map((item) => <Link className="list-row" to={`/${role}/complaints/${item.id}`} key={item.id}><div className="list-leading"><span className={`complaint-thumb ${item.image ? "has-image" : ""}`}>{item.image ? "사진" : item.roomNo}</span><div><div className="row-title"><strong>{item.title}</strong><ComplaintStatusBadge status={item.status} /></div><p>{role === "manager" ? `${item.roomNo} · ` : ""}{item.date}</p></div></div>{role === "manager" && <span className={`urgency-label ${item.urgency >= 8 ? "urgent" : ""}`}>긴급도 {item.urgency}</span>}<IconChevronRightLine /></Link>)}</div></StateBoundary></section>
  </>;
}
