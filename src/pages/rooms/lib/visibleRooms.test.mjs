import assert from 'node:assert/strict';
import test from 'node:test';
import { groupRoomsByFloor, visibleRooms } from './visibleRooms.mjs';

const rooms = [
  ['1011', 'INVITED'],
  ['1002', 'LIVING'],
  ['201', 'EMPTY'],
  ['1101', 'EMPTY'],
  ['102', 'INVITED'],
  ['1010', 'LIVING'],
  ['901', 'INVITED'],
  ['1001', 'EMPTY'],
  ['101', 'LIVING'],
].map(([roomNo, roomStatus], index) => ({
  roomId: index + 1,
  roomNo,
  roomStatus,
  roomStatusLabel: { LIVING: '입주', INVITED: '초대됨', EMPTY: '공실' }[
    roomStatus
  ],
  residentName: roomStatus === 'LIVING' ? `입주민 ${roomNo}` : null,
}));

test('sorts mixed room numbers by floor then unit', () => {
  assert.deepEqual(
    visibleRooms(rooms, 'ALL').map((room) => room.roomNo),
    ['101', '102', '201', '901', '1001', '1002', '1010', '1011', '1101'],
  );
});

test('sorts units within the same floor', () => {
  assert.deepEqual(
    visibleRooms(
      rooms.filter(
        (room) => room.roomNo.startsWith('10') && room.roomNo.length === 4,
      ),
      'ALL',
    ).map((room) => room.roomNo),
    ['1001', '1002', '1010', '1011'],
  );
});

test('keeps floor and unit order for every status filter', () => {
  for (const [status, expected] of [
    ['LIVING', ['101', '1002', '1010']],
    ['INVITED', ['102', '901', '1011']],
    ['EMPTY', ['201', '1001', '1101']],
  ]) {
    assert.deepEqual(
      visibleRooms(rooms, status).map((room) => room.roomNo),
      expected,
    );
  }
});

test('handles an empty list and a status filter with no matches', () => {
  assert.deepEqual(visibleRooms([], 'ALL'), []);
  assert.deepEqual(visibleRooms([], 'LIVING'), []);
  assert.deepEqual(visibleRooms([rooms[0]], 'EMPTY'), []);
});

test('handles one room', () => {
  assert.deepEqual(visibleRooms([rooms[0]], 'ALL'), [rooms[0]]);
  assert.deepEqual(visibleRooms([rooms[0]], 'INVITED'), [rooms[0]]);
});

test('preserves the source array and each room object for all filters', () => {
  const original = rooms.map((room) => Object.freeze({ ...room }));
  const source = Object.freeze([...original]);
  for (const status of ['ALL', 'LIVING', 'INVITED', 'EMPTY']) {
    const result = visibleRooms(source, status);
    assert.notEqual(result, source);
    assert.deepEqual(source, original);
    for (const room of result) {
      assert.equal(
        room,
        source.find((item) => item.roomId === room.roomId),
      );
    }
  }
});

test('groups sorted rooms by actual floor without merging floors 1 and 10', () => {
  const sorted = visibleRooms(rooms, 'ALL');
  const source = Object.freeze([...sorted]);
  const grouped = groupRoomsByFloor(source);
  assert.deepEqual(
    grouped.map(({ floor, rooms: floorRooms }) => ({
      floor,
      roomNumbers: floorRooms.map((room) => room.roomNo),
    })),
    [
      { floor: 1, roomNumbers: ['101', '102'] },
      { floor: 2, roomNumbers: ['201'] },
      { floor: 9, roomNumbers: ['901'] },
      { floor: 10, roomNumbers: ['1001', '1002', '1010', '1011'] },
      { floor: 11, roomNumbers: ['1101'] },
    ],
  );
  assert.deepEqual(source, sorted);
  assert.deepEqual(
    grouped.flatMap((group) => group.rooms),
    sorted,
  );
  grouped
    .flatMap((group) => group.rooms)
    .forEach((room, index) => {
      assert.equal(room, sorted[index]);
    });
});

test('shows only floors with rooms matching each status and handles empty groups', () => {
  for (const [status, expectedFloors] of [
    ['LIVING', [1, 10]],
    ['INVITED', [1, 9, 10]],
    ['EMPTY', [2, 10, 11]],
  ]) {
    const filtered = visibleRooms(rooms, status);
    const grouped = groupRoomsByFloor(filtered);
    assert.deepEqual(
      grouped.map((group) => group.floor),
      expectedFloors,
    );
    assert.deepEqual(
      grouped.flatMap((group) => group.rooms),
      filtered,
    );
  }
  assert.deepEqual(groupRoomsByFloor([]), []);
});

test('keeps rooms with an unrecognized floor in a separate final group', () => {
  const other = ['A101', '1', '001'].map((roomNo, index) => ({
    ...rooms[0],
    roomId: 100 + index,
    roomNo,
  }));
  const known = rooms.find((room) => room.roomNo === '101');
  assert.deepEqual(groupRoomsByFloor([...other, known]), [
    { floor: 1, rooms: [known] },
    { floor: null, rooms: other },
  ]);
});
