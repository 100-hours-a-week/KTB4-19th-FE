import { Badge } from "@seed-design/react";
import { roomStatusMeta } from "../model/statusMeta";
import type { RoomStatus } from "../model/types";

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const meta = roomStatusMeta[status];
  return <Badge tone={meta.tone} variant="weak">{meta.label}</Badge>;
}
