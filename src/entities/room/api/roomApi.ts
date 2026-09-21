import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';
import type { RoomStatus } from '../model/types';

const managerBuildingsBase = '/managers/me/buildings';
const managerRoomsBase = '/managers/me/rooms';
const residentBase = '/residents/me';

export type RoomResponse = {
  roomId: number;
  roomNo: string;
  roomStatus: RoomStatus;
};

export type RoomBulkCreateResponse = {
  buildingId: number;
  createdCount: number;
  rooms: RoomResponse[];
};

export type RoomSummaryResponse = {
  livingCount: number;
  invitedCount: number;
  emptyCount: number;
  totalCount: number;
};

export type RoomListItem = {
  roomId: number;
  roomNo: string;
  roomStatus: RoomStatus;
  roomStatusLabel: '입주' | '초대됨' | '공실';
  residentName: string | null;
};

export type RoomListResponse = {
  buildingId: number;
  buildingName: string | null;
  totalCount: number;
  rooms: RoomListItem[];
};

export type InvitationCodeResponse = {
  roomId: number;
  roomNo: string;
  roomStatus: RoomStatus;
  roomStatusLabel: string;
  codeId: number;
  code: string;
  createdAt: string;
  expiresAt: string;
  reissued: boolean;
};

export type InvitationCodeValidationResponse = {
  buildingName: string;
  roomNo: string;
};

export type RoomConnectionResponse = {
  buildingName: string;
  roomNo: string;
};

export const roomApi = {
  createMany: (buildingId: number, roomNos: string[]) =>
    apiRequest<RoomBulkCreateResponse>(
      `${managerBuildingsBase}/${buildingId}/rooms`,
      {
        method: 'POST',
        body: { roomNos },
      },
    ),
  summary: (buildingId: number) =>
    apiRequest<RoomSummaryResponse>(
      `${managerBuildingsBase}/${buildingId}/rooms/summary`,
    ),
  list: (buildingId: number) =>
    apiRequest<RoomListResponse>(`${managerBuildingsBase}/${buildingId}/rooms`),
  moveOutResident: (roomId: number) =>
    apiRequest<null>(`${managerRoomsBase}/${roomId}/resident`, {
      method: 'DELETE',
    }),
  issueInvitation: (roomId: number) =>
    apiRequest<InvitationCodeResponse>(
      `${managerRoomsBase}/${roomId}/invitation-codes`,
      { method: 'POST' },
    ),
  cancelInvitation: (roomId: number, codeId: number) =>
    apiRequest<null>(
      `${managerRoomsBase}/${roomId}/invitation-codes/${codeId}`,
      { method: 'DELETE' },
    ),
  validateInvitation: (code: string) =>
    apiRequest<InvitationCodeValidationResponse>(
      `${residentBase}/invitation-codes/${encodeURIComponent(code)}`,
    ),
  connectRoom: (code: string) =>
    apiRequest<RoomConnectionResponse>(`${residentBase}/room`, {
      method: 'PUT',
      body: { code },
    }),
};

export const roomKeys = {
  list: (buildingId: number) =>
    ['rooms', 'manager', 'list', buildingId] as const,
  summary: (buildingId: number) =>
    ['rooms', 'manager', 'summary', buildingId] as const,
};

export function useManagerRooms(buildingId: number) {
  return useQuery({
    queryKey: roomKeys.list(buildingId),
    queryFn: () => roomApi.list(buildingId),
    enabled: Number.isInteger(buildingId) && buildingId > 0,
  });
}

export function useManagerRoomSummary(buildingId: number) {
  return useQuery({
    queryKey: roomKeys.summary(buildingId),
    queryFn: () => roomApi.summary(buildingId),
    enabled: Number.isInteger(buildingId) && buildingId > 0,
  });
}
