import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { canAutoLoadOlder, scrollTopAfterPrepend } from './olderMessages.mjs';

type OlderMessagesQuery = {
  data?: { pages: unknown[] };
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => Promise<unknown>;
};

type ScrollSnapshot = { container: Element; height: number };

function scrollContainerOf(element: Element): Element {
  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') return parent;
  }
  return document.scrollingElement ?? document.documentElement;
}

export function useOlderMessages(query: OlderMessagesQuery) {
  const olderMessagesRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const { fetchNextPage } = query;
  const autoLoad = canAutoLoadOlder(query);
  const pageCount = query.data?.pages.length ?? 0;

  const loadOlderMessages = useCallback(() => {
    const top = olderMessagesRef.current;
    if (top) {
      const container = scrollContainerOf(top);
      snapshotRef.current = { container, height: container.scrollHeight };
    }
    fetchNextPage();
  }, [fetchNextPage]);

  useEffect(() => {
    const top = olderMessagesRef.current;
    if (!top || !autoLoad) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadOlderMessages();
    });
    observer.observe(top);
    return () => observer.disconnect();
  }, [autoLoad, loadOlderMessages]);

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return;
    snapshotRef.current = null;
    snapshot.container.scrollTop = scrollTopAfterPrepend({
      scrollTop: snapshot.container.scrollTop,
      previousHeight: snapshot.height,
      currentHeight: snapshot.container.scrollHeight,
    });
  }, [pageCount]);

  return { olderMessagesRef, loadOlderMessages };
}
