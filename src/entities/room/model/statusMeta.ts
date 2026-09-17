import type { RoomStatus } from "./types";

export const roomStatusMeta: Record<RoomStatus, { label: string; tone: "neutral" | "warning" | "positive" }> = {
  EMPTY: { label: "공실", tone: "neutral" },
  INVITED: { label: "초대됨", tone: "warning" },
  LIVING: { label: "입주", tone: "positive" },
};
