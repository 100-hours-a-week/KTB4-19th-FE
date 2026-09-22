import {
  IconBuilding2Line,
  IconChevronRightLine,
  IconDocumentLine,
  IconDocumentPlusLine,
} from '@karrotmarket/react-monochrome-icon';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { useManagerBuilding } from '@/entities/building';
import {
  ComplaintStatusBadge,
  useManagerComplaintSummary,
  useManagerComplaints,
} from '@/entities/complaint';
import { useAuth } from '@/entities/session';
import { useManagerRoomSummary } from '@/entities/room';
import { isApiError } from '@/shared/api';
import { formatListTime, formatRoomNo } from '@/shared/lib';
import {
  FullPageLoading,
  MetricCard,
  PageTitle,
  StateBoundary,
} from '@/shared/ui';

export function ManagerHomePage() {
  const auth = useAuth();
  const location = useLocation();
  const buildingQuery = useManagerBuilding();
  const roomSummaryQuery = useManagerRoomSummary();
  const complaintSummaryQuery = useManagerComplaintSummary();

  if (isApiError(buildingQuery.error) && buildingQuery.error.status === 404)
    return <BuildingRequired />;

  const requiredQueries = [
    buildingQuery,
    roomSummaryQuery,
    complaintSummaryQuery,
  ];
  if (requiredQueries.some((query) => query.isPending))
    return <FullPageLoading />;
  if (requiredQueries.some((query) => query.isError)) {
    return (
      <StateBoundary
        state="error"
        onRetry={() => {
          void Promise.all(requiredQueries.map((query) => query.refetch()));
        }}
      >
        {null}
      </StateBoundary>
    );
  }

  const building = buildingQuery.data;
  const roomSummary = roomSummaryQuery.data;
  const complaintSummary = complaintSummaryQuery.data;
  if (!building || !roomSummary || !complaintSummary)
    return <FullPageLoading />;

  const occupancyRate = roomSummary.totalCount
    ? Math.round((roomSummary.livingCount / roomSummary.totalCount) * 100)
    : 0;
  const activeComplaintCount =
    complaintSummary.pendingCount + complaintSummary.inProgressCount;
  const roomsPath = `/manager/rooms${location.search}`;
  return (
    <>
      <PageTitle
        eyebrow="오늘의 건물 운영"
        title={`안녕하세요, ${auth.user?.userName ?? '관리자'} 님`}
        description={`${building.buildingName ?? '관리 중인 건물'}의 중요한 변화를 한눈에 확인하세요.`}
      />
      <section className="metrics-grid">
        <MetricCard
          label="입주 세대"
          value={`${roomSummary.livingCount} / ${roomSummary.totalCount}`}
          helper={`입주율 ${occupancyRate}%`}
          tone="brand"
        />
        <MetricCard
          label="초대 중"
          value={roomSummary.invitedCount}
          helper="입주 연결 대기 중"
        />
        <MetricCard
          label="처리 전 민원"
          value={activeComplaintCount}
          helper={`접수 ${complaintSummary.pendingCount}건 · 처리 중 ${complaintSummary.inProgressCount}건`}
        />
        <MetricCard
          label="이번 주 완료"
          value={complaintSummary.weeklyDoneCount}
          helper="이번 주 처리 완료"
        />
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>최근 민원</h2>
          <Link to="/manager/complaints">전체 보기</Link>
        </div>
        <ComplaintRows compact />
      </section>
      <section className="panel quick-panel">
        <div className="section-heading">
          <h2>건물 운영 바로가기</h2>
        </div>
        <div className="quick-grid">
          <QuickLink
            to={roomsPath}
            icon={<IconBuilding2Line />}
            title="호실 현황"
            text="입주·초대 상태 확인"
          />
          <QuickLink
            to="/manager/documents"
            icon={<IconDocumentPlusLine />}
            title="운영규칙"
            text="운영규칙 관리"
          />
          <QuickLink
            to="/manager/complaints"
            icon={<IconDocumentLine />}
            title="민원 관리"
            text={`처리 전 ${activeComplaintCount}건`}
          />
        </div>
      </section>
    </>
  );
}

function BuildingRequired() {
  return (
    <div className="result-state">
      <h2>건물 정보가 필요해요</h2>
      <p>등록된 건물이 없어요. 건물을 먼저 등록해 주세요.</p>
      <Link className="text-link" to="/manager/building/new">
        건물 등록으로 이동
      </Link>
    </div>
  );
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
