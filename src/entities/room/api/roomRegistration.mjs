export function isRoomCountValid(floorCount, roomsPerFloor) {
  return [floorCount, roomsPerFloor].every(
    (count) =>
      Number.isInteger(Number(count)) &&
      Number(count) >= 1 &&
      Number(count) <= 20,
  );
}

export function generateRoomNumbers(floorCount, roomsPerFloor) {
  const floors = Number(floorCount);
  const rooms = Number(roomsPerFloor);
  if (!isRoomCountValid(floors, rooms)) return [];

  return Array.from(
    { length: floors },
    (_, floorIndex) => floorIndex + 1,
  ).flatMap((floor) =>
    Array.from(
      { length: rooms },
      (_, roomIndex) => `${floor}${String(roomIndex + 1).padStart(2, '0')}`,
    ),
  );
}

export function selectedRoomNumbers(roomNumbers, selectedNumbers) {
  return roomNumbers.filter((roomNo) => selectedNumbers.has(roomNo));
}

export function groupRoomNumbersByFloor(roomNumbers) {
  const floors = new Map();
  for (const roomNo of roomNumbers) {
    // 호수는 항상 두 자리이므로 끝의 두 자리를 제외한 숫자가 실제 층수입니다.
    const floor = Number(roomNo.slice(0, -2));
    if (!Number.isInteger(floor) || floor < 1) continue;
    const floorRooms = floors.get(floor) ?? [];
    floorRooms.push(roomNo);
    floors.set(floor, floorRooms);
  }
  return [...floors]
    .sort(([left], [right]) => left - right)
    .map(([floor, floorRooms]) => ({ floor, roomNumbers: floorRooms }));
}
