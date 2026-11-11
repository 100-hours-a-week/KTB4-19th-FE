import assert from 'node:assert/strict';
import test from 'node:test';
import {
  characterCount,
  nextTypedLength,
  renderableText,
  replyTypingIntervalMs,
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
  assert.equal(renderableText('좋아요👍', 4, true), '좋아요👍');
  assert.equal(renderableText('좋아요👍', 3, true), '좋아요');
});

function streamed(text) {
  return renderableText(text, characterCount(text), false);
}

function typedFrames(text, complete) {
  const frames = [];
  for (let length = 0; length <= characterCount(text); length += 1)
    frames.push(renderableText(text, length, complete));
  return frames;
}

test('델타가 굵은 글씨 중간에서 끊기면 닫힐 때까지 그 앞까지만 보여 준다', () => {
  assert.equal(streamed('누수는 **긴'), '누수는 ');
  assert.equal(streamed('누수는 **긴급**'), '누수는 **긴급**');
  assert.equal(streamed('누수는 **긴급** 접'), '누수는 **긴급** 접');
});

test('델타가 굵은 글씨 기호 사이에서 끊겨도 기호를 보여 주지 않는다', () => {
  assert.equal(streamed('누수는 *'), '누수는 ');
  assert.equal(streamed('명령어 `npm'), '명령어 ');
});

test('목록 기호만 온 줄은 내용이 올 때까지 보여 주지 않는다', () => {
  assert.equal(streamed('확인할 점\n-'), '확인할 점\n');
  assert.equal(streamed('확인할 점\n1. '), '확인할 점\n');
  assert.equal(streamed('확인할 점\n## '), '확인할 점\n');
  assert.equal(streamed('확인할 점\n- 배관'), '확인할 점\n- 배관');
});

test('숫자로 시작하는 문장은 목록 기호가 아님이 확인되면 보여 준다', () => {
  assert.equal(streamed('2025'), '');
  assert.equal(streamed('2025년'), '2025년');
});

test('응답이 끝나면 닫히지 않은 기호도 글자 그대로 모두 보여 준다', () => {
  const text = '3 * 4 = 12이고 **주의';
  assert.equal(renderableText(text, characterCount(text), true), text);
});

test('닫는 기호가 도착한 굵은 글씨는 한 글자씩 굵게 타이핑한다', () => {
  const text = '안내드려요\n- **누수 확인** 필요\n- 사진 첨부';
  const frames = typedFrames(text, true);
  assert.ok(frames.includes('안내드려요\n'));
  assert.ok(frames.includes('안내드려요\n- **누**'));
  assert.ok(frames.includes('안내드려요\n- **누수**'));
  assert.ok(!frames.includes('안내드려요\n- **누수 **'));
  assert.ok(!frames.includes('안내드려요\n- ****'));
  for (const frame of frames) {
    assert.equal(frame.split('**').length % 2, 1);
    assert.doesNotMatch(frame, /\n- ?$/);
  }
});

test('이미 보여 준 글자는 다음 타이핑에서 바뀌지 않는다', () => {
  const text = '**긴급** 민원은 `관리실`에 바로 전달돼요\n1. 사진\n2. 위치';
  const frames = typedFrames(text, true);
  frames.slice(1).forEach((frame, index) => {
    assert.ok(frame.startsWith(frames[index].replace(/(\*\*|\*|`)$/, '')));
  });
  assert.equal(frames.at(-1), text);
});

test('스트림이 비정상 종료되면 닫히지 않은 구문 앞까지만 남는다', () => {
  const text = '배관 점검이 필요해요. **오늘 안에';
  const frames = typedFrames(text, false);
  assert.equal(frames.at(-1), '배관 점검이 필요해요. ');
});
