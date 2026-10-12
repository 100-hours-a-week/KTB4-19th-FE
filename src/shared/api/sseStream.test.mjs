import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startSseStream } from './sseStream.mjs';

const tick = () => new Promise((resolve) => setImmediate(resolve));
function store() {
  let token = 'first';
  const listeners = new Set();
  return {
    get: () => token,
    set(value) {
      token = value;
      listeners.forEach((fn) => fn(value));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
function fixture(signal) {
  let body;
  return {
    get body() {
      return body;
    },
    response: new Response(
      new ReadableStream({
        start(controller) {
          body = controller;
          signal?.addEventListener(
            'abort',
            () => {
              try {
                controller.error(new DOMException('Aborted', 'AbortError'));
              } catch {
              }
            },
            { once: true },
          );
        },
      }),
      { headers: { 'Content-Type': 'text/event-stream' } },
    ),
  };
}
function options(overrides = {}) {
  return {
    url: 'http://localhost/stream',
    events: ['delta', 'message', 'done'],
    tokens: store(),
    reissue: async () => null,
    onConnected: () => {},
    onEvent: () => {},
    onStatus: () => {},
    ...overrides,
  };
}

test('EventSource delivers named/default UTF8 multiline events and cleanup closes the stream', async () => {
  let stream;
  const events = [];
  let opens = 0;
  const stop = startSseStream(
    options({
      onConnected: () => opens++,
      onEvent: (event) => events.push(event),
      fetch: async (_url, init) => {
        assert.equal(
          new Headers(init.headers).get('Authorization'),
          'Bearer first',
        );
        assert.equal(init.credentials, 'include');
        stream = fixture(init.signal);
        return stream.response;
      },
    }),
  );
  try {
    await tick();
    const bytes = new TextEncoder().encode(
      '\uFEFF:connected\r\nevent: delta\r\ndata: 한글\r\ndata: second\r\n\r\ndata: not-json\n\nevent: done\rdata: \r\r:heartbeat\n\nevent: incomplete\ndata: unfinished',
    );
    for (const byte of bytes) stream.body.enqueue(Uint8Array.of(byte));
    await tick();
    assert.equal(opens, 1);
    assert.deepEqual(events, [
      { event: 'delta', data: '한글\nsecond' },
      { event: 'message', data: 'not-json' },
      { event: 'done', data: '' },
    ]);
    stop();
    await tick();
    assert.throws(() => stream.body.enqueue(new Uint8Array()), TypeError);
    assert.equal(events.length, 3);
  } finally {
    stop();
  }
});

test('EOF recovery uses the EventSource retry interval and cleanup cancels it', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const streams = [];
  let opens = 0;
  const states = [];
  const stop = startSseStream(
    options({
      onConnected: () => opens++,
      onStatus: (value) => states.push(value),
      fetch: async (_url, init) => {
        const stream = fixture(init.signal);
        streams.push(stream);
        return stream.response;
      },
    }),
  );
  try {
    await tick();
    streams[0].body.close();
    await tick();
    assert.equal(states.at(-1), 'reconnecting');
    t.mock.timers.tick(2999);
    await tick();
    assert.equal(streams.length, 1);
    t.mock.timers.tick(1);
    await tick();
    assert.equal(opens, 2);
    streams[1].body.close();
    await tick();
    stop();
    t.mock.timers.tick(30_000);
    await tick();
    assert.equal(streams.length, 2);
  } finally {
    stop();
  }
});

test('401 refresh opens once with the replacement token; repeated 401 and other 4xx stop', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (const status of [200, 401, 403, 404]) {
    const tokens = store();
    let calls = 0;
    let refreshes = 0;
    const states = [];
    const stop = startSseStream(
      options({
        tokens,
        reissue: async () => {
          refreshes++;
          tokens.set('new');
          return 'new';
        },
        onStatus: (value) => states.push(value),
        fetch: async (_url, init) => {
          calls++;
          assert.equal(
            new Headers(init.headers).get('Authorization'),
            calls === 1 ? 'Bearer first' : 'Bearer new',
          );
          return calls === 1
            ? new Response(null, { status: 401 })
            : status === 200
              ? fixture(init.signal).response
              : new Response(null, { status });
        },
      }),
    );
    try {
      await tick();
      assert.equal(calls, 2);
      assert.equal(refreshes, 1);
      assert.equal(states.at(-1), status === 200 ? 'connected' : 'unavailable');
      t.mock.timers.tick(30_000);
      await tick();
      assert.equal(calls, 2);
    } finally {
      stop();
    }
  }
});

test('token replacement/logout cancel pending requests; late responses and StrictMode cannot revive them', async () => {
  const tokens = store();
  const pending = [];
  let callbacks = 0;
  const config = options({
    tokens,
    onConnected: () => callbacks++,
    fetch: (_url, init) =>
      new Promise((resolve) => pending.push({ resolve, signal: init.signal })),
  });
  const stop = startSseStream(config);
  try {
    await tick();
    tokens.set('second');
    await tick();
    assert.equal(pending[0].signal.aborted, true);
    tokens.set(null);
    tokens.set('other-account');
    for (const request of pending) request.resolve(fixture().response);
    await tick();
    assert.equal(callbacks, 0);
    assert.equal(pending.length, 2);
  } finally {
    stop();
  }
  const strictStop = startSseStream(config);
  strictStop();
  await tick();
  assert.equal(pending.length, 2);
});

test('slow refresh and an external token replacement do not open duplicate connections', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  for (const external of [false, true]) {
    const tokens = store();
    let calls = 0;
    let opens = 0;
    let finish;
    const refreshed = new Promise((resolve) => {
      finish = resolve;
    });
    const stop = startSseStream(
      options({
        tokens,
        reissue: () => refreshed,
        onConnected: () => opens++,
        fetch: async (_url, init) =>
          ++calls === 1
            ? new Response(null, { status: 401 })
            : fixture(init.signal).response,
      }),
    );
    try {
      await tick();
      t.mock.timers.tick(100_000);
      await tick();
      assert.equal(calls, 1);
      tokens.set(external ? 'external' : 'refreshed');
      await tick();
      assert.equal(opens, 1);
      finish(external ? 'stale' : 'refreshed');
      await tick();
      assert.equal(calls, 2);
    } finally {
      stop();
    }
  }
});

test('failed refresh stops and refresh completed after logout cannot reopen the previous account', async () => {
  const states = [];
  const stop = startSseStream(
    options({
      reissue: async () => {
        throw new Error('refresh failed');
      },
      onStatus: (value) => states.push(value),
      fetch: async () => new Response(null, { status: 401 }),
    }),
  );
  try {
    await tick();
    assert.equal(states.at(-1), 'unavailable');
  } finally {
    stop();
  }
  const tokens = store();
  let calls = 0;
  let finish;
  const refreshed = new Promise((resolve) => {
    finish = resolve;
  });
  const stopLate = startSseStream(
    options({
      tokens,
      reissue: () => refreshed,
      onConnected: () => assert.fail('old account opened'),
      fetch: async () => {
        calls++;
        return new Response(null, { status: 401 });
      },
    }),
  );
  try {
    await tick();
    tokens.set(null);
    tokens.set('other-account');
    finish('other-account');
    await tick();
    assert.equal(calls, 1);
  } finally {
    stopLate();
  }
});

test('server failures use library recovery; invalid content type stops', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  const states = [];
  const stop = startSseStream(
    options({
      onStatus: (value) => states.push(value),
      fetch: async (_url, init) =>
        ++calls === 1
          ? new Response(null, { status: 503 })
          : fixture(init.signal).response,
    }),
  );
  try {
    await tick();
    assert.equal(states.at(-1), 'reconnecting');
    t.mock.timers.tick(3000);
    await tick();
    assert.equal(calls, 2);
    assert.equal(states.at(-1), 'connected');
  } finally {
    stop();
  }
  const invalidStates = [];
  const stopInvalid = startSseStream(
    options({
      onStatus: (value) => invalidStates.push(value),
      fetch: async () => new Response('<html>'),
    }),
  );
  try {
    await tick();
    assert.equal(invalidStates.at(-1), 'unavailable');
  } finally {
    stopInvalid();
  }
});
