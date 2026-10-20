import { Badge } from '@seed-design/react';

export function ComplaintUrgentBadge({
  isUrgent,
}: {
  isUrgent: boolean | null;
}) {
  if (!isUrgent) return null;
  return (
    <Badge tone="critical" variant="weak">
      긴급
    </Badge>
  );
}
