import test from "node:test";
import assert from "node:assert/strict";
import { generateRoomNumbers, groupRoomNumbersByFloor, isRoomCountValid, selectedRoomNumbers } from "./roomRegistration.mjs";

test("generates room numbers by floor and unit number", () => {
  assert.deepEqual(generateRoomNumbers(2, 3), ["101", "102", "103", "201", "202", "203"]);
});

test("accepts only floor and unit counts from one through twenty", () => {
  assert.equal(isRoomCountValid(1, 20), true);
  assert.equal(isRoomCountValid(20, 1), true);
  assert.equal(isRoomCountValid(0, 5), false);
  assert.equal(isRoomCountValid(21, 5), false);
});

test("bulk request includes only rooms explicitly selected in the preview", () => {
  assert.deepEqual(selectedRoomNumbers(["101", "102", "201"], new Set(["101", "201"])), ["101", "201"]);
});

test("groups two-digit floor numbers without matching floors that share a prefix", () => {
  const rooms = generateRoomNumbers(15, 3);
  const floors = groupRoomNumbersByFloor(rooms);

  assert.deepEqual(floors[0], { floor: 1, roomNumbers: ["101", "102", "103"] });
  assert.deepEqual(floors[9], { floor: 10, roomNumbers: ["1001", "1002", "1003"] });
  assert.equal(floors[0].roomNumbers.length, 3);
  assert.equal(floors.length, 15);
});
