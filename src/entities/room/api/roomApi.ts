import { apiRequest } from "@/shared/api";

export type RoomResponse = {
  roomId: number;
  roomNo: string;
  roomStatus: "EMPTY" | "INVITED" | "LIVING";
};

export type RoomBulkCreateResponse = {
  buildingId: number;
  createdCount: number;
  rooms: RoomResponse[];
};

export const roomApi = {
  createMany: (buildingId: number, roomNos: string[]) =>
    apiRequest<RoomBulkCreateResponse>(`/managers/me/buildings/${buildingId}/rooms`, {
      method: "POST",
      body: { roomNos },
    }),
};
