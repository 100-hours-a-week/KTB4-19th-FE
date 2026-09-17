import { Badge } from "@seed-design/react";
import { ActionButton } from "seed-design/ui/action-button";
import { insights } from "@/entities/insight";
import { PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function InsightsPage({ state }: { state: ViewState }) {
  return <><PageTitle eyebrow="AI 운영 도우미" title="AI 인사이트" description="민원 흐름에서 놓치기 쉬운 반복과 긴급 신호를 모았어요." /><StateBoundary state={state} emptyTitle="아직 분석된 인사이트가 없어요"><div className="insights-layout">{insights.map((item) => <article className="insight-card" key={item.id}><div className="insight-card-top"><Badge tone={item.urgency >= 9 ? "critical" : "warning"} variant="weak">{item.category}</Badge><span>긴급도 {item.urgency}</span></div><h2>{item.title}</h2><p>{item.cause}</p><div className="insight-footer"><span>관련 민원 {item.count}건</span><ActionButton variant="neutralOutline">민원 확인</ActionButton></div></article>)}</div></StateBoundary></>;
}
