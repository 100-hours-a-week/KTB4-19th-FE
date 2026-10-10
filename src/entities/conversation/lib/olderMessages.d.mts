export function orderedMessages<T>(pages: Array<{ messages: T[] }>): T[];

export function latestMessageId(
  pages: Array<{ messages: Array<{ messageId: number }> }> | undefined,
): number | null;

export function canAutoLoadOlder(state: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
}): boolean;

export function scrollTopAfterPrepend(position: {
  scrollTop: number;
  previousHeight: number;
  currentHeight: number;
}): number;
