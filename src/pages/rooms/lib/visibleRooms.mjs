export function visibleRooms(rooms, status) {
  return rooms
    .filter((room) => status === 'ALL' || room.roomStatus === status)
    .sort((left, right) =>
      left.roomNo.localeCompare(right.roomNo, undefined, { numeric: true }),
    );
}

export function groupRoomsByFloor(rooms) {
  const floors = new Map();
  for (const room of rooms) {
    const floor = /^\d{3,}$/.test(room.roomNo)
      ? Number(room.roomNo.slice(0, -2))
      : 0;
    const key = floor > 0 ? floor : null;
    const floorRooms = floors.get(key) ?? [];
    floorRooms.push(room);
    floors.set(key, floorRooms);
  }
  return [...floors]
    .sort(([left], [right]) => (left ?? Infinity) - (right ?? Infinity))
    .map(([floor, floorRooms]) => ({ floor, rooms: floorRooms }));
}
