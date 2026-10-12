import assert from 'node:assert/strict';
import { test } from 'node:test';
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
