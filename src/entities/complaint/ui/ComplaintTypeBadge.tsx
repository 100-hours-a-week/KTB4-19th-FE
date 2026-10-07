import { Badge } from '@seed-design/react';
import type { ComplaintType } from '../model/types';

export function ComplaintTypeBadge({ type }: { type: ComplaintType | null }) {
  if (type !== 'QA') return null;
  return (
    <Badge tone="brand" variant="weak">
      QA
    </Badge>
  );
}
