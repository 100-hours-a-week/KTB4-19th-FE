import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import type { ConversationMessagesResponse } from '../model/types';
import { conversationApi } from './conversationApi';

const messagePageSize = 20;

export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params: { keyword: string; size: number }) =>
    [...conversationKeys.lists(), params] as const,
  messages: (conversationId: number) =>
    [...conversationKeys.all, 'messages', conversationId] as const,
};

export type MessagesData = InfiniteData<
  ConversationMessagesResponse,
  number | undefined
>;

export function useConversationList(
  params: { keyword?: string; size?: number } = {},
) {
  const keyword = params.keyword?.trim() ?? '';
  const size = params.size ?? 20;
  return useInfiniteQuery({
    queryKey: conversationKeys.list({ keyword, size }),
    queryFn: ({ pageParam }) =>
      conversationApi.list({ keyword, cursor: pageParam, size }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor !== null
        ? lastPage.nextCursor
        : undefined,
  });
}

export function conversationMessagesQuery(conversationId: number) {
  return {
    queryKey: conversationKeys.messages(conversationId),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      conversationApi.messages(conversationId, {
        cursor: pageParam,
        size: messagePageSize,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: ConversationMessagesResponse) =>
      lastPage.hasNext && lastPage.nextCursor !== null
        ? lastPage.nextCursor
        : undefined,
  };
}

export function useConversationMessages(conversationId: number) {
  return useInfiniteQuery(conversationMessagesQuery(conversationId));
}
