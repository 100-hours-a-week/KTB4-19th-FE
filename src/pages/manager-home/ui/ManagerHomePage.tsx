import { IconBuilding2Line, IconChevronRightLine, IconDocumentLine, IconDocumentPlusLine, IconSparkle2Line } from "@karrotmarket/react-monochrome-icon";
import { Badge } from "@seed-design/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { useAuth } from "@/entities/session";
import { ComplaintStatusBadge, complaints } from "@/entities/complaint";
import type { RouteRole } from "@/shared/config";
import { MetricCard, PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function ManagerHomePage({ state }: { state: ViewState }) {
  const auth = useAuth();
  if (auth.user && auth.user.buildingId == null) {
    return <><PageTitle eyebrow="관리자 시작하기" title="관리할 건물을 등록해 주세요" description="건물을 등록하면 호실과 운영규칙을 관리할 수 있어요." /><section className="panel onboarding-empty"><h2>아직 관리 중인 건물이 없어요</h2><p>건물 등록을 완료하면 관리자 기능을 사용할 수 있습니다.</p><Link to="/manager/building/new"><ActionButton variant="brandSolid">건물 등록하기</ActionButton></Link></section></>;
  }
  return <><PageTitle eyebrow="오늘의 건물 운영" title="안녕하세요, 김관리 님" description="A타워의 중요한 변화를 한눈에 확인하세요." />
    <StateBoundary state={state} emptyTitle="아직 운영 데이터가 없어요">
      <section className="metrics-grid"><MetricCard label="입주 세대" value="5 / 14" helper="입주율 36%" tone="brand" /><MetricCard label="초대 중" value={2} helper="7일 안에 만료" /><MetricCard label="처리 전 민원" value={5} helper="긴급 2건" /><MetricCard label="이번 주 완료" value={12} helper="지난주보다 3건 많아요" /></section>
      <div className="dashboard-grid">
        <section className="panel insight-hero"><div className="section-heading"><div><p className="eyebrow">AI 인사이트</p><h2>지금 먼저 확인해 보세요</h2></div><Link to="/manager/insights">전체 보기</Link></div><div className="insight-content"><span className="insight-icon"><IconSparkle2Line /></span><div><Badge tone="critical" variant="weak">긴급도 9</Badge><h3>3층 누수 민원이 빠르게 늘고 있어요</h3><p>같은 배관 라인에서 24시간 내 3건이 접수됐어요.</p><ActionButton variant="brandSolid" onClick={() => {}}>관련 민원 보기</ActionButton></div></div></section>
        <section className="panel"><div className="section-heading"><h2>최근 민원</h2><Link to="/manager/complaints">전체 보기</Link></div><ComplaintRows compact /></section>
      </div>
      <section className="panel quick-panel"><div className="section-heading"><h2>건물 운영 바로가기</h2></div><div className="quick-grid"><QuickLink to="/manager/rooms" icon={<IconBuilding2Line />} title="호실 현황" text="입주·초대 상태 확인" /><QuickLink to="/manager/documents" icon={<IconDocumentPlusLine />} title="운영규칙" text="등록 문서 3개" /><QuickLink to="/manager/complaints" icon={<IconDocumentLine />} title="민원 관리" text="처리 전 5건" /></div></section>
    </StateBoundary></>;
}

function QuickLink({
  to,
  icon,
  title,
  text,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link className="quick-link" to={to}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
      <IconChevronRightLine />
    </Link>
  );
}

function ComplaintRows({ compact = false }: { compact?: boolean }) {
  const query = useManagerComplaints({ size: compact ? 2 : 20 });
  if (query.isPending)
    return (
      <div className="skeleton-stack" aria-label="불러오는 중">
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    );
  if (query.isError)
    return (
      <div className="result-state result-state--compact">
        <h2>최근 민원을 불러오지 못했어요</h2>
        <ActionButton variant="neutralOutline" onClick={() => query.refetch()}>
          다시 시도
        </ActionButton>
      </div>
    );
  if (query.data.complaints.length === 0)
    return (
      <div className="result-state result-state--compact">
        <h2>최근 민원이 없어요</h2>
        <p>새 민원이 접수되면 이곳에서 확인할 수 있어요.</p>
      </div>
    );
  return (
    <div className="list-stack">
      {query.data.complaints.map((item) => (
        <Link
          className="list-row"
          to={`/manager/complaints/${item.complaintId}`}
          key={item.complaintId}
        >
          <div className="list-leading">
            <span className={`urgency-dot ${item.isUrgent ? 'urgent' : ''}`} />
            <div>
              <div className="row-title">
                <strong>{item.title}</strong>
                <ComplaintStatusBadge status={item.statusCode} />
              </div>
              <p>
                {formatRoomNo(item.roomNo)} · {formatListTime(item.createdAt)}
              </p>
            </div>
          </div>
          <span className="urgency-label">긴급도 {item.urgency}</span>
          <IconChevronRightLine />
        </Link>
      ))}
    </div>
  );
}
