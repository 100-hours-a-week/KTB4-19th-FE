const listeners = new Map();

export function subscribeSseEvent(event, listener) {
  const current = listeners.get(event) ?? new Set();
  current.add(listener);
  listeners.set(event, current);
  return () => {
    current.delete(listener);
    if (current.size === 0) listeners.delete(event);
  };
}

export function publishSseEvent(event, data) {
  for (const listener of listeners.get(event) ?? []) listener(data);
}
