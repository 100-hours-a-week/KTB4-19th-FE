import type { RoomListItem, RoomStatus } from '@/entities/room';

export function visibleRooms(
  rooms: readonly RoomListItem[],
  status: 'ALL' | RoomStatus,
): RoomListItem[];

export function groupRoomsByFloor(
  rooms: readonly RoomListItem[],
): Array<{ floor: number | null; rooms: RoomListItem[] }>;
