import type { RoomListItem, RoomStatus } from '@/entities/room';

export function visibleRooms(
  rooms: readonly RoomListItem[],
  status: 'ALL' | RoomStatus,
): RoomListItem[];
