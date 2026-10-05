export function visibleRooms(rooms, status) {
  return rooms
    .filter((room) => status === 'ALL' || room.roomStatus === status)
    .sort((left, right) =>
      left.roomNo.localeCompare(right.roomNo, undefined, { numeric: true }),
    );
}
