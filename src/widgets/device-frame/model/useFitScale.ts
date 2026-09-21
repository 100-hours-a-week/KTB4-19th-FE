import { useLayoutEffect, useState, type RefObject } from 'react';

/** 목업 전체가 브라우저 높이·폭 안에 들어오도록 축소 배율을 계산한다. 크게 키우지는 않는다. */
export function useFitScale(
  target: RefObject<HTMLElement | null>,
  { enabled, gutter }: { enabled: boolean; gutter: number },
) {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = target.current;
    if (!enabled || !element) return;
    const update = () => {
      // offsetWidth/Height는 transform 영향을 받지 않는 원래 크기다.
      const next = Math.min(
        1,
        (window.innerHeight - gutter * 2) / element.offsetHeight,
        (window.innerWidth - gutter * 2) / element.offsetWidth,
      );
      setScale(Math.max(0.4, Math.round(next * 1000) / 1000));
    };
    update();
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [target, enabled, gutter]);
  return enabled ? scale : 1;
}
