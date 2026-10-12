import { publishSseEvent } from '../../../shared/api/sseEvents.mjs';
import { startSseStream } from '../../../shared/api/sseStream.mjs';

export function startNotificationStream({
  sync,
  relayEvents = [],
  ...options
}) {
  return startSseStream({
    ...options,
    events: ['notification', ...relayEvents],
    onConnected: sync,
    onEvent: ({ event, data }) => {
      if (relayEvents.includes(event)) return publishSseEvent(event, data);
      if (event !== 'notification') return;
      try {
        const payload = JSON.parse(data);
        if (
          Number.isSafeInteger(payload?.data?.userNotiId) &&
          payload.data.userNotiId > 0
        )
          sync();
      } catch {
      }
    },
  });
}
