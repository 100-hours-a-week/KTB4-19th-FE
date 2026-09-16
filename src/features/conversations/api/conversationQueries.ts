import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type {
  ConversationMessagesResponse,
  Message,
  MessageSendResponse,
  SummaryCard,
} from "../model/types";
import { conversationApi } from "./conversationApi";

const MESSAGE_PAGE_SIZE = 20;

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (params: { keyword: string; size: number }) => [...conversationKeys.lists(), params] as const,
  messages: (conversationId: number) => [...conversationKeys.all, "messages", conversationId] as const,
};

type MessagesData = InfiniteData<ConversationMessagesResponse, number | undefined>;

export function useConversationList(params: { keyword?: string; size?: number } = {}) {
  const keyword = params.keyword?.trim() ?? "";
  const size = params.size ?? 20;
  return useInfiniteQuery({
    queryKey: conversationKeys.list({ keyword, size }),
    queryFn: ({ pageParam }) => conversationApi.list({ keyword, page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });
}

export function conversationMessagesQuery(conversationId: number) {
  return {
    queryKey: conversationKeys.messages(conversationId),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      conversationApi.messages(conversationId, { cursor: pageParam, size: MESSAGE_PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: ConversationMessagesResponse) =>
      lastPage.hasNext && lastPage.nextCursor !== null ? lastPage.nextCursor : undefined,
  };
}

export function useConversationMessages(conversationId: number) {
  return useInfiniteQuery(conversationMessagesQuery(conversationId));
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const created = await conversationApi.start({ content });
      // 화면 전환 전에 대화 상세를 미리 받아 전송 중 상태가 끊기지 않게 한다.
      await queryClient.prefetchInfiniteQuery(conversationMessagesQuery(created.conversationId));
      return created;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => conversationApi.send(conversationId, { content }),
    onSuccess: (sent) => {
      queryClient.setQueryData<MessagesData>(conversationKeys.messages(conversationId), (data) =>
        appendTurn(data, [toResidentMessage(sent), sent.assistantMessage], sent.summaryCard),
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/**
 * 이번 턴의 메시지와 접수 확인 카드를 최신 페이지에 반영한다.
 * 카드는 대화 상태에서 파생되므로 서버가 이번 턴에 주지 않았으면 함께 지운다.
 */
function appendTurn(
  data: MessagesData | undefined,
  messages: Message[],
  summaryCard: SummaryCard | undefined,
): MessagesData | undefined {
  if (!data || data.pages.length === 0) return data;
  const [latest, ...older] = data.pages;
  return {
    ...data,
    pages: [{ ...latest, messages: [...latest.messages, ...messages], summaryCard }, ...older],
  };
}

function toResidentMessage(sent: MessageSendResponse): Message {
  return {
    messageId: sent.messageId,
    senderType: sent.senderType,
    messageType: sent.messageType,
    content: sent.content,
    attachments: sent.attachments,
    createdAt: sent.createdAt,
  };
}
