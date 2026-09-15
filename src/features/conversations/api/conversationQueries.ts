import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
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
  // 대화 상세 조회 API는 요약 카드 내용을 돌려주지 않으므로, 전송 응답으로 받은 카드를 세션 동안 보관한다.
  // TODO(spec-contract): 서버가 SUMMARY_CARD 내용을 저장·조회하도록 확정되면 제거한다.
  summaryCards: (conversationId: number) => [...conversationKeys.all, "summaryCards", conversationId] as const,
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
      rememberSummaryCard(queryClient, created.conversationId, created.assistantMessage);
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
      rememberSummaryCard(queryClient, conversationId, sent.assistantMessage);
      queryClient.setQueryData<MessagesData>(conversationKeys.messages(conversationId), (data) =>
        appendToLatestPage(data, [toResidentMessage(sent), sent.assistantMessage]),
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

/** 전송 응답으로 받은 요약 카드. 서버에서 다시 조회하지 않는 클라이언트 캐시다. */
export function useSummaryCards(conversationId: number) {
  const { data } = useQuery<Record<number, SummaryCard>>({
    queryKey: conversationKeys.summaryCards(conversationId),
    queryFn: () => ({}),
    initialData: {},
    staleTime: Infinity,
  });
  return data;
}

function rememberSummaryCard(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: number,
  message: Message,
) {
  const summaryCard = message.summaryCard;
  if (message.messageType !== "SUMMARY_CARD" || !summaryCard) return;
  queryClient.setQueryData<Record<number, SummaryCard>>(conversationKeys.summaryCards(conversationId), (cards) => ({
    ...cards,
    [message.messageId]: summaryCard,
  }));
}

function appendToLatestPage(data: MessagesData | undefined, messages: Message[]): MessagesData | undefined {
  if (!data || data.pages.length === 0) return data;
  const [latest, ...older] = data.pages;
  return { ...data, pages: [{ ...latest, messages: [...latest.messages, ...messages] }, ...older] };
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
