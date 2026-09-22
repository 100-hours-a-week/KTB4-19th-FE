import { useCallback, useEffect, useState } from 'react';

/**
 * 429 응답의 retryAfterSeconds 동안 남은 초를 제공한다. 0이면 다시 요청할 수 있다.
 */
export function useRetryCountdown() {
  const [until, setUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (until === null) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) setUntil(null);
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [until]);

  const start = useCallback(
    (seconds: number) => setUntil(Date.now() + seconds * 1000),
    [],
  );
  return { remaining, start };
}
