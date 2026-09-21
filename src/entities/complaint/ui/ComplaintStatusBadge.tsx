import { Badge } from '@seed-design/react';
import type { ComplaintStatus } from '../model/types';

const complaintStatusMeta: Record<
  ComplaintStatus,
  { label: string; tone: 'neutral' | 'informative' | 'positive' }
> = {
  PENDING: { label: '처리전', tone: 'neutral' },
  IN_PROGRESS: { label: '처리중', tone: 'informative' },
  DONE: { label: '처리완료', tone: 'positive' },
};

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const meta = complaintStatusMeta[status];
  return (
    <Badge tone={meta.tone} variant="weak">
      {meta.label}
    </Badge>
  );
}
