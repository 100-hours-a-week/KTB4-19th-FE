export type SseEvent = { event: string; data: string };
export type SseStreamStatus =
  'connecting' | 'connected' | 'reconnecting' | 'unavailable';
export type SseStreamOptions = {
  url: string;
  events: string[];
  tokens: {
    get(): string | null;
    subscribe(listener: (token: string | null) => void): () => void;
  };
  reissue: () => Promise<string | null>;
  onConnected: () => void;
  onEvent: (event: SseEvent) => void;
  onStatus: (status: SseStreamStatus) => void;
  fetch?: typeof fetch;
};
export function startSseStream(options: SseStreamOptions): () => void;
