import {
  IconChevronRightLine,
  IconMagnifyingglassLine,
} from '@karrotmarket/react-monochrome-icon';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  SegmentedControl,
  SegmentedControlItem,
} from 'seed-design/ui/segmented-control';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import {
  ComplaintStatusBadge,
  ComplaintThumbnail,
  useManagerComplaints,
  useResidentComplaints,
  type ComplaintStatus,
} from '@/entities/complaint';
import type { RouteRole } from '@/shared/config';
import { formatListTime, formatRoomNo } from '@/shared/lib';
import { PageTitle, StateBoundary, type ViewState } from '@/shared/ui';

export function ComplaintsPage({ role }: { role: RouteRole }) {
  return role === 'manager' ? (
    <ManagerComplaintsPage />
  ) : (
    <ResidentComplaintsPage />
  );
}

function ManagerComplaintsPage() {
  const [status, setStatus] = useState<'ALL' | ComplaintStatus>('ALL');
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const query = useManagerComplaints({
    keyword,
    status: status === 'ALL' ? undefined : [status],
  });
  const viewState: ViewState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : query.data?.complaints.length
        ? 'default'
        : 'empty';

  const search = (event: FormEvent) => {
    event.preventDefault();
    setKeyword(input.trim());
  };

  return (
    <>
      <PageTitle
        eyebrow="민원 관리"
        title="민원 목록"
        description="긴급도와 처리 상태를 기준으로 빠르게 대응하세요."
      />
      <section className="panel list-panel">
        <div className="list-tools">
          <form onSubmit={search} role="search">
            <TextField
              prefixIcon={<IconMagnifyingglassLine />}
              value={input}
              onValueChange={({ value }) => setInput(value)}
            >
              <TextFieldInput
                aria-label="민원 제목 검색"
                placeholder="민원 제목 검색 후 Enter"
              />
            </TextField>
          </form>
          <SegmentedControl
            aria-label="민원 처리 상태"
            value={status}
            onValueChange={(value) => setStatus(value as typeof status)}
          >
            <SegmentedControlItem value="ALL">전체</SegmentedControlItem>
            <SegmentedControlItem value="PENDING">처리전</SegmentedControlItem>
            <SegmentedControlItem value="IN_PROGRESS">
              처리중
            </SegmentedControlItem>
            <SegmentedControlItem value="DONE">완료</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <StateBoundary
          state={viewState}
          onRetry={() => query.refetch()}
          emptyTitle="조건에 맞는 민원이 없어요"
        >
          <div className="list-stack">
            {query.data?.complaints.map((item) => (
              <Link
                className="list-row"
                to={`/manager/complaints/${item.complaintId}`}
                key={item.complaintId}
              >
                <div className="list-leading">
                  <ComplaintThumbnail
                    fileUrl={item.fileUrl}
                    fallback={formatRoomNo(item.roomNo)}
                  />
                  <div>
                    <div className="row-title">
                      <strong>{item.title}</strong>
                      <ComplaintStatusBadge status={item.statusCode} />
                    </div>
                    <p>
                      {item.buildingName} · {formatRoomNo(item.roomNo)} ·{' '}
                      {formatListTime(item.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`urgency-label ${item.isUrgent ? 'urgent' : ''}`}
                >
                  긴급도 {item.urgency}
                </span>
                <IconChevronRightLine />
              </Link>
            ))}
          </div>
        </StateBoundary>
      </section>
    </>
  );
}

function ResidentComplaintsPage() {
  const [status, setStatus] = useState<'ALL' | ComplaintStatus>('ALL');
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const query = useResidentComplaints({
    keyword,
    status: status === 'ALL' ? undefined : [status],
    page: 0,
    size: 20,
  });
  const viewState: ViewState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : query.data?.complaints.length
        ? 'default'
        : 'empty';

  const search = (event: FormEvent) => {
    event.preventDefault();
    setKeyword(input.trim());
  };

  return (
    <>
      <PageTitle
        eyebrow="나의 민원"
        title="접수한 민원"
        description="접수한 민원의 처리 상태를 확인하세요."
      />
      <section className="panel list-panel">
        <div className="list-tools">
          <form onSubmit={search} role="search">
            <TextField
              prefixIcon={<IconMagnifyingglassLine />}
              value={input}
              onValueChange={({ value }) => setInput(value)}
            >
              <TextFieldInput
                aria-label="민원 제목 검색"
                placeholder="민원 제목 검색 후 Enter"
              />
            </TextField>
          </form>
          <SegmentedControl
            aria-label="민원 처리 상태"
            value={status}
            onValueChange={(value) => setStatus(value as typeof status)}
          >
            <SegmentedControlItem value="ALL">전체</SegmentedControlItem>
            <SegmentedControlItem value="PENDING">처리전</SegmentedControlItem>
            <SegmentedControlItem value="IN_PROGRESS">
              처리중
            </SegmentedControlItem>
            <SegmentedControlItem value="DONE">완료</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <StateBoundary
          state={viewState}
          onRetry={() => query.refetch()}
          emptyTitle="조건에 맞는 민원이 없어요"
        >
          <div className="list-stack">
            {query.data?.complaints.map((item) => (
              <Link
                className="list-row"
                to={`/resident/complaints/${item.complaintId}`}
                key={item.complaintId}
              >
                <div className="list-leading">
                  <ComplaintThumbnail fileUrl={item.fileUrl} fallback="민원" />
                  <div>
                    <div className="row-title">
                      <strong>{item.title}</strong>
                      <ComplaintStatusBadge status={item.statusCode} />
                    </div>
                    <p>{formatListTime(item.createdAt)}</p>
                  </div>
                </div>
                <IconChevronRightLine />
              </Link>
            ))}
          </div>
        </StateBoundary>
      </section>
    </>
  );
}
