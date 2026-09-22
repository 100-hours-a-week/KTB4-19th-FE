export {
  roomApi,
  roomKeys,
  useManagerRooms,
  useManagerRoomSummary,
  type InvitationCodeResponse,
  type InvitationCodeValidationResponse,
  type RoomBulkCreateResponse,
  type RoomConnectionResponse,
  type RoomListItem,
  type RoomListResponse,
  type RoomResponse,
  type RoomSummaryResponse,
} from './api/roomApi';
export { rooms } from './model/mock';
export { roomStatusMeta } from './model/statusMeta';
export type { RoomStatus } from './model/types';
export { RoomStatusBadge } from './ui/RoomStatusBadge';
export {
  generateRoomNumbers,
  groupRoomNumbersByFloor,
  isRoomCountValid,
  selectedRoomNumbers,
} from './api/roomRegistration.mjs';
