import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  conversationApi,
  conversationKeys,
  conversationMessagesQuery,
  type Message,
  type MessagesData,
  type MessageSendResponse,
} from '@/entities/conversation';

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const created = await conversationApi.start({ content });
      // 화면 전환 전에 대화 상세를 미리 받아 전송 중 상태가 끊기지 않게 한다.
      await queryClient.prefetchInfiniteQuery(
        conversationMessagesQuery(created.conversationId),
      );
      return created;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      conversationApi.send(conversationId, { content }),
    onSuccess: (sent) => {
      queryClient.setQueryData<MessagesData>(
        conversationKeys.messages(conversationId),
        (data) =>
          appendTurn(data, [toResidentMessage(sent), sent.assistantMessage]),
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

export function useResolveConversation(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationApi.resolve(conversationId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(conversationId),
        }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
      ]),
  });
}

/** 이번 턴의 메시지를 최신 페이지에 반영한다. 접수 확인 카드는 AI 메시지에 실려 온다. */
function appendTurn(
  data: MessagesData | undefined,
  messages: Message[],
): MessagesData | undefined {
  if (!data || data.pages.length === 0) return data;
  const [latest, ...older] = data.pages;
  return {
    ...data,
    pages: [
      { ...latest, messages: [...latest.messages, ...messages] },
      ...older,
    ],
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
