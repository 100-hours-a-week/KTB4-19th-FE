import assert from 'node:assert/strict';
import test from 'node:test';
import { visibleRooms } from './visibleRooms.mjs';

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
