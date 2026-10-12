import type { SseStreamOptions } from '../../../shared/api/sseStream.mjs';
export type { SseStreamStatus as StreamStatus } from '../../../shared/api/sseStream.mjs';
export function startNotificationStream(
  options: Omit<SseStreamOptions, 'events' | 'onConnected' | 'onEvent'> & {
    sync: () => void;
    relayEvents?: string[];
  },
): () => void;
