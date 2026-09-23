import {
  IconChevronRightLine,
  IconSparkle2Line,
} from '@karrotmarket/react-monochrome-icon';
import { Badge } from '@seed-design/react';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import {
  ComplaintPhotoGrid,
  ComplaintStatusBadge,
  useManagerComplaint,
  useResidentComplaint,
  useUpdateManagerComplaintStatus,
} from '@/entities/complaint';
import type { RouteRole } from '@/shared/config';
import { formatListTime, formatOccurredTime, formatRoomNo } from '@/shared/lib';
import { InfoRow, PageTitle, StateBoundary, type ViewState } from '@/shared/ui';
import { isApiError } from '@/shared/api';

export function ComplaintDetailPage({ role }: { role: RouteRole }) {
  return role === 'manager' ? (
    <ManagerComplaintDetailPage />
  ) : (
    <ResidentComplaintDetailPage />
  );
}

function ManagerComplaintDetailPage() {
  const { complaintId: rawComplaintId } = useParams();
  const complaintId = Number(rawComplaintId);
  if (!Number.isInteger(complaintId) || complaintId < 1)
    return <ComplaintUnavailable role="manager" />;
  return <ManagerComplaintDetail complaintId={complaintId} />;
}

function ManagerComplaintDetail({ complaintId }: { complaintId: number }) {
  const query = useManagerComplaint(complaintId);
  const updateStatus = useUpdateManagerComplaintStatus();
  const complaint = query.data;
  const nextStatus =
    complaint?.statusCode === 'PENDING'
      ? 'IN_PROGRESS'
      : complaint?.statusCode === 'IN_PROGRESS'
        ? 'DONE'
        : null;
  const viewState: ViewState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : complaint
        ? 'default'
        : 'empty';

  const update = () => {
    if (nextStatus)
      updateStatus.mutate({ complaintId, statusCode: nextStatus });
  };

  return (
    <>
      <PageTitle
        eyebrow={`민원 관리 · #${complaint?.complaintId ?? complaintId}`}
        title={complaint?.title ?? '민원 상세'}
        description={
          complaint
            ? `${complaint.buildingName} ${formatRoomNo(complaint.roomNo)} · ${formatListTime(complaint.createdAt)} 접수`
            : undefined
        }
        action={
          complaint && (
            <ActionButton
              variant="neutralOutline"
              onClick={update}
              loading={updateStatus.isPending}
              disabled={!nextStatus || updateStatus.isPending}
            >
              {complaint.statusCode === 'PENDING'
                ? '처리 시작'
                : complaint.statusCode === 'IN_PROGRESS'
                  ? '처리 완료'
                  : '완료된 민원'}
            </ActionButton>
          )
        }
      />
      <StateBoundary
        state={viewState}
        onRetry={() => query.refetch()}
        emptyTitle="민원을 찾을 수 없어요"
      >
        {complaint && (
          <>
            {updateStatus.isError && (
              <Callout
                tone="critical"
                description={complaintUpdateError(updateStatus.error)}
              />
            )}
            <div className="detail-grid">
              <section className="panel complaint-detail">
                <div className="complaint-heading">
                  <ComplaintStatusBadge status={complaint.statusCode} />
                  <Badge
                    tone={complaint.isUrgent ? 'critical' : 'neutral'}
                    variant="weak"
                  >
                    긴급도 {complaint.urgency}
                  </Badge>
                </div>
                <section>
                  <h2>AI 요약</h2>
                  <div className="summary-box">
                    <IconSparkle2Line />
                    <p>{complaint.aiSummary ?? '요약 정보가 없어요.'}</p>
                  </div>
                </section>
                <section>
                  <h2>발생 정보</h2>
                  <InfoRow label="위치" value={complaint.location ?? '-'} />
                  <InfoRow
                    label="시점"
                    value={formatOccurredTime(complaint.occurredTime) ?? '-'}
                  />
                  <InfoRow label="증상" value={complaint.symptom ?? '-'} />
                </section>
                <section>
                  <h2>첨부 사진 ({complaint.attachmentCount})</h2>
                  <ComplaintPhotoGrid photos={complaint.attachments} />
                </section>
              </section>
              <aside className="panel detail-aside">
                <h2>처리 정보</h2>
                <InfoRow
                  label="접수일"
                  value={formatListTime(complaint.createdAt)}
                />
                <InfoRow
                  label="완료일"
                  value={
                    complaint.resolvedAt
                      ? formatListTime(complaint.resolvedAt)
                      : '-'
                  }
                />
                {complaint.conversationAvailable && (
                  <Link
                    className="text-link"
                    to={`/manager/conversations/${complaint.conversationId}`}
                  >
                    AI 대화 원본 보기 <IconChevronRightLine />
                  </Link>
                )}
              </aside>
            </div>
          </>
        )}
      </StateBoundary>
    </>
  );
}

function ResidentComplaintDetailPage() {
  const { complaintId: rawComplaintId } = useParams();
  const complaintId = Number(rawComplaintId);
  if (!Number.isInteger(complaintId) || complaintId < 1)
    return <ComplaintUnavailable role="resident" />;
  return <ResidentComplaintDetail complaintId={complaintId} />;
}

function ResidentComplaintDetail({ complaintId }: { complaintId: number }) {
  const query = useResidentComplaint(complaintId);
  if (
    query.isError &&
    isApiError(query.error) &&
    (query.error.status === 403 || query.error.status === 404)
  ) {
    return (
      <ComplaintUnavailable
        role="resident"
        title={
          query.error.status === 403
            ? '이 민원에 접근할 수 없어요'
            : '민원을 찾을 수 없어요'
        }
      />
    );
  }

  const complaint = query.data;
  const viewState: ViewState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : complaint
        ? 'default'
        : 'empty';

  return (
    <>
      <PageTitle
        eyebrow={`나의 민원 · #${complaint?.complaintId ?? complaintId}`}
        title={complaint?.title ?? '민원 상세'}
        description={
          complaint
            ? `${complaint.buildingName} ${formatRoomNo(complaint.roomNo)} · ${formatListTime(complaint.createdAt)} 접수`
            : undefined
        }
      />
      <StateBoundary
        state={viewState}
        onRetry={() => query.refetch()}
        emptyTitle="민원을 찾을 수 없어요"
      >
        {complaint && (
          <div className="detail-grid">
            <section className="panel complaint-detail">
              <div className="complaint-heading">
                <ComplaintStatusBadge status={complaint.statusCode} />
              </div>
              <section>
                <h2>AI 요약</h2>
                <div className="summary-box">
                  <IconSparkle2Line />
                  <p>{complaint.aiSummary || '요약 정보가 없어요.'}</p>
                </div>
              </section>
              <section>
                <h2>발생 정보</h2>
                <InfoRow label="위치" value={complaint.location || '-'} />
                <InfoRow
                  label="시점"
                  value={formatOccurredTime(complaint.occurredTime) || '-'}
                />
                <InfoRow label="증상" value={complaint.symptom || '-'} />
              </section>
              <section>
                <h2>첨부 사진 ({complaint.attachmentCount})</h2>
                <ComplaintPhotoGrid photos={complaint.attachments} />
              </section>
            </section>
            <aside className="panel detail-aside">
              <h2>처리 정보</h2>
              <InfoRow
                label="접수일"
                value={formatListTime(complaint.createdAt)}
              />
              <InfoRow
                label="완료일"
                value={
                  complaint.resolvedAt
                    ? formatListTime(complaint.resolvedAt)
                    : '-'
                }
              />
              {complaint.conversationAvailable && (
                <Link
                  className="text-link"
                  to={`/resident/conversations/${complaint.conversationId}`}
                >
                  접수 대화 보기 <IconChevronRightLine />
                </Link>
              )}
            </aside>
          </div>
        )}
      </StateBoundary>
    </>
  );
}

function ComplaintUnavailable({
  role,
  title = '민원을 찾을 수 없어요',
}: {
  role: RouteRole;
  title?: string;
}) {
  return (
    <div className="result-state">
      <h2>{title}</h2>
      <p>민원 목록에서 다시 선택해 주세요.</p>
      <Link className="text-link" to={`/${role}/complaints`}>
        민원 목록으로 돌아가기
      </Link>
    </div>
  );
}

function complaintUpdateError(error: unknown) {
  if (isApiError(error) && (error.status === 400 || error.status === 422))
    return error.violations[0]?.reason ?? '처리 상태를 확인해 주세요.';
  if (isApiError(error) && error.status === 403)
    return '담당 건물의 민원만 변경할 수 있어요.';
  if (isApiError(error) && error.status === 404)
    return '민원을 찾을 수 없어요.';
  return '민원 처리 상태를 변경하지 못했어요. 다시 시도해 주세요.';
}
