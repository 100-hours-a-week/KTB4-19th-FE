import { EventSource } from 'eventsource';

export function startSseStream({
  url,
  events,
  tokens,
  reissue,
  onConnected,
  onEvent,
  onStatus,
  fetch: request = globalThis.fetch,
}) {
  let stopped = false;
  let generation = 0;
  let source;
  let refreshing = false;
  let refreshed = false;
  const restart = () => {
    const current = ++generation;
    source?.close();
    if (stopped || !tokens.get()) return;
    void Promise.resolve().then(() => {
      const active = () => !stopped && current === generation;
      if (!active() || !tokens.get()) return;
      onStatus('connecting');
      const stream = new EventSource(url, {
        withCredentials: true,
        fetch: async (input, init) => {
          const headers = new Headers(init.headers);
          headers.set('Authorization', `Bearer ${tokens.get()}`);
          const response = await request(input, {
            ...init,
            headers,
            credentials: 'include',
          });
          if (!active()) {
            await response.body?.cancel();
            throw new DOMException('Stream closed', 'AbortError');
          }
          if (response.status >= 500) {
            await response.body?.cancel();
            throw new Error('Stream unavailable');
          }
          return response;
        },
      });
      source = stream;
      stream.addEventListener('open', () => {
        if (!active()) return;
        refreshed = false;
        onStatus('connected');
        onConnected();
      });
      for (const event of events) {
        stream.addEventListener(event, (message) => {
          if (active()) onEvent({ event: message.type, data: message.data });
        });
      }
      stream.addEventListener('error', async (error) => {
        if (!active()) return;
        if (stream.readyState === EventSource.CONNECTING) {
          onStatus('reconnecting');
          return;
        }
        if (error.code !== 401 || refreshed) {
          onStatus('unavailable');
          return;
        }
        refreshed = true;
        refreshing = true;
        let token;
        try {
          token = await reissue();
        } catch {
          token = null;
        } finally {
          refreshing = false;
        }
        if (!active()) return;
        if (token && tokens.get() === token) restart();
        else onStatus('unavailable');
      });
    });
  };
  const unsubscribe = tokens.subscribe((token) => {
    if (token === null) stopped = true;
    if (!refreshing) refreshed = false;
    restart();
  });
  restart();
  return () => {
    stopped = true;
    generation++;
    source?.close();
    unsubscribe();
  };
}
