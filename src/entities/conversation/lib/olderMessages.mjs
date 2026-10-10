export function orderedMessages(pages) {
  return [...pages].reverse().flatMap((page) => page.messages);
}

export function latestMessageId(pages) {
  return pages?.[0]?.messages.at(-1)?.messageId ?? null;
}

export function canAutoLoadOlder({
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
}) {
  return hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
}

export function scrollTopAfterPrepend({
  scrollTop,
  previousHeight,
  currentHeight,
}) {
  return scrollTop + Math.max(currentHeight - previousHeight, 0);
}
