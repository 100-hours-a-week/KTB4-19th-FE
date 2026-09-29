import assert from 'node:assert/strict';
import test from 'node:test';
import { isClosedAt } from './conversationClosing.mjs';

const closesAt = '2026-09-29T12:05:00+09:00';
const closingTime = new Date(closesAt).getTime();

test('종료 시각 전에는 진행 중이다', () => {
  assert.equal(isClosedAt(closesAt, closingTime - 1), false);
});

test('종료 시각이 되면 종료된다', () => {
  assert.equal(isClosedAt(closesAt, closingTime), true);
});

test('종료 시각이 없으면 시간이 지나도 종료되지 않는다', () => {
  assert.equal(isClosedAt(null, closingTime + 60 * 60 * 1000), false);
});
