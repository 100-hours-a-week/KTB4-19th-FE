import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';
import type { RoomStatus } from '../model/types';

const managerBuildingBase = '/managers/me/building';
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
  createMany: (roomNos: string[]) =>
    apiRequest<RoomBulkCreateResponse>(`${managerBuildingBase}/rooms`, {
      method: 'POST',
      body: { roomNos },
    }),
  summary: () =>
    apiRequest<RoomSummaryResponse>(`${managerBuildingBase}/rooms/summary`),
  list: () => apiRequest<RoomListResponse>(`${managerBuildingBase}/rooms`),
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
  list: () => ['rooms', 'manager', 'list'] as const,
  summary: () => ['rooms', 'manager', 'summary'] as const,
};

export function useManagerRooms() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: () => roomApi.list(),
  });
}

export function useManagerRoomSummary() {
  return useQuery({
    queryKey: roomKeys.summary(),
    queryFn: () => roomApi.summary(),
  });
}
