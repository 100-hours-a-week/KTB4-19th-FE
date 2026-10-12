import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publishSseEvent, subscribeSseEvent } from './sseEvents.mjs';

test('구독한 이벤트 이름의 데이터만 받는다', () => {
  const received = [];
  const unsubscribe = subscribeSseEvent('chat-done', (data) =>
    received.push(data),
  );
  try {
    publishSseEvent('chat-done', '{"conversationId":1}');
    publishSseEvent('chat-error', '{"conversationId":2}');
    assert.deepEqual(received, ['{"conversationId":1}']);
  } finally {
    unsubscribe();
  }
});

test('구독을 해제하면 더 이상 받지 않는다', () => {
  const received = [];
  const unsubscribe = subscribeSseEvent('chat-done', (data) =>
    received.push(data),
  );
  unsubscribe();

  publishSseEvent('chat-done', '{"conversationId":1}');

  assert.deepEqual(received, []);
});
