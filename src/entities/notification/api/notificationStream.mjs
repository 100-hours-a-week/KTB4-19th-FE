import { startSseStream } from '../../../shared/api/sseStream.mjs';

export function startNotificationStream({ sync, ...options }) {
  return startSseStream({
    ...options,
    events: ['notification'],
    onConnected: sync,
    onEvent: ({ event, data }) => {
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
