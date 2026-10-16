import assert from 'node:assert/strict';
import test from 'node:test';
import {
  characterCount,
  nextTypedLength,
  replyTypingIntervalMs,
  typedText,
} from './replyTyping.mjs';

function ticksToFinish(textLength) {
  let typedLength = 0;
  let ticks = 0;
  while (typedLength < textLength) {
    typedLength = nextTypedLength(typedLength, textLength);
    ticks += 1;
  }
  return ticks;
}

test('짧은 답변은 한 번에 세 글자씩 보여 준다', () => {
  assert.equal(nextTypedLength(0, 20), 3);
  assert.equal(nextTypedLength(3, 20), 6);
});

test('긴 답변도 2초 안에 다 보여 준다', () => {
  assert.ok(ticksToFinish(600) * replyTypingIntervalMs <= 2000);
  assert.ok(ticksToFinish(3000) * replyTypingIntervalMs <= 2000);
});

test('답변 글자 수를 넘겨 보여 주지 않는다', () => {
  assert.equal(nextTypedLength(19, 20), 20);
  assert.equal(nextTypedLength(20, 20), 20);
});

test('이모지를 반으로 자르지 않는다', () => {
  assert.equal(characterCount('좋아요👍'), 4);
  assert.equal(typedText('좋아요👍', 4), '좋아요👍');
  assert.equal(typedText('좋아요👍', 3), '좋아요');
});
