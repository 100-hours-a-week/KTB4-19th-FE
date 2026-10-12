import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subscribeSseEvent } from '../../../shared/api/sseEvents.mjs';
import { startNotificationStream } from './notificationStream.mjs';

test('notification adapter syncs on open and validates signals without filtering event ID order', async () => {
  let body;
  let signals = 0;
  const stop = startNotificationStream({
    url: 'http://localhost/stream',
    tokens: { get: () => 'access', subscribe: () => () => {} },
    reissue: async () => null,
    sync: () => signals++,
    onStatus: () => {},
    fetch: async (_url, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            body = controller;
            init.signal.addEventListener(
              'abort',
              () => controller.error(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
  });
  try {
    await new Promise((resolve) => setImmediate(resolve));
    body.enqueue(
      new TextEncoder().encode(
        'event: other\ndata: {"data":{"userNotiId":99}}\n\n' +
          'event: notification\ndata: broken\n\n' +
          'event: notification\ndata: {"data":{"userNotiId":"3"}}\n\n' +
          'event: notification\ndata: {"data":{"userNotiId":0}}\n\n' +
          'event: notification\ndata: {"data":{"userNotiId":9}}\n\n' +
          'event: notification\ndata: {"data":{"userNotiId":1}}\n\n',
      ),
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(signals, 3);
  } finally {
    stop();
  }
});

test('전달하기로 한 이벤트는 알림 동기화 없이 구독자에게 넘긴다', async () => {
  let body;
  let signals = 0;
  const relayed = [];
  const unsubscribe = subscribeSseEvent('chat-done', (data) =>
    relayed.push(data),
  );
  const stop = startNotificationStream({
    url: 'http://localhost/stream',
    tokens: { get: () => 'access', subscribe: () => () => {} },
    reissue: async () => null,
    sync: () => signals++,
    relayEvents: ['chat-done'],
    onStatus: () => {},
    fetch: async (_url, init) =>
      new Response(
        new ReadableStream({
          start(controller) {
            body = controller;
            init.signal.addEventListener(
              'abort',
              () => controller.error(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
  });
  try {
    await new Promise((resolve) => setImmediate(resolve));
    const syncedOnOpen = signals;
    body.enqueue(
      new TextEncoder().encode(
        'event: chat-done\ndata: {"conversationId":7}\n\n' +
          'event: chat-error\ndata: {"conversationId":8}\n\n',
      ),
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(relayed, ['{"conversationId":7}']);
    assert.equal(signals, syncedOnOpen);
  } finally {
    stop();
    unsubscribe();
  }
});
