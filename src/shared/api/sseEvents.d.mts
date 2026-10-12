export function subscribeSseEvent(
  event: string,
  listener: (data: string) => void | Promise<void>,
): () => void;
export function publishSseEvent(event: string, data: string): void;
