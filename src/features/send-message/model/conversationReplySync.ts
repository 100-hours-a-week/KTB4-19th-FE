import { useEffect, useRef } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  appendMessages,
  conversationKeys,
  conversationReplyEvent,
  conversationReplyFailedEvent,
  isAwaitingReply,
  orderedMessages,
  parseConversationReply,
  parseConversationReplyFailure,
  type ConversationReplyFailure,
  type MessagesData,
} from '@/entities/conversation';
import { subscribeSseEvent, type SseStreamStatus } from '@/shared/api';

const allConversationMessages = [...conversationKeys.all, 'messages'];

export function useConversationReplySync(status: SseStreamStatus) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribeReply = subscribeSseEvent(
      conversationReplyEvent,
      async (data) => {
        const reply = parseConversationReply(data);
        if (!reply) return;
        const messagesKey = conversationKeys.messages(reply.conversationId);
        await finishLoading(queryClient, messagesKey);
        const cached = queryClient.getQueryData<MessagesData>(messagesKey);
        if (cached && isAwaitingReply(orderedMessages(cached.pages))) {
          queryClient.setQueryData<MessagesData>(messagesKey, (data) =>
            appendMessages(data, [reply.assistantMessage], reply.closesAt),
          );
        } else {
          void queryClient.invalidateQueries({
            queryKey: messagesKey,
            refetchType: 'all',
          });
        }
        void queryClient.invalidateQueries({
          queryKey: conversationKeys.lists(),
        });
      },
    );
    const unsubscribeFailure = subscribeSseEvent(
      conversationReplyFailedEvent,
      async (data) => {
        const failure = parseConversationReplyFailure(data);
        if (!failure) return;
        const messagesKey = conversationKeys.messages(failure.conversationId);
        await finishLoading(queryClient, messagesKey);
        void queryClient.invalidateQueries({
          queryKey: messagesKey,
          refetchType: 'all',
        });
        void queryClient.invalidateQueries({
          queryKey: conversationKeys.lists(),
        });
      },
    );
    return () => {
      unsubscribeReply();
      unsubscribeFailure();
    };
  }, [queryClient]);

  useEffect(() => {
    if (status === 'connected')
      void queryClient.invalidateQueries({
        queryKey: allConversationMessages,
        refetchType: 'all',
      });
  }, [status, queryClient]);
}

export function useConversationReplyFailure(
  conversationId: number,
  onFailure: (failure: ConversationReplyFailure) => void,
) {
  const handler = useRef(onFailure);
  useEffect(() => {
    handler.current = onFailure;
  });
  useEffect(
    () =>
      subscribeSseEvent(conversationReplyFailedEvent, (data) => {
        const failure = parseConversationReplyFailure(data);
        if (failure?.conversationId === conversationId)
          handler.current(failure);
      }),
    [conversationId],
  );
}

async function finishLoading(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
) {
  const query = queryClient.getQueryCache().find({ queryKey, exact: true });
  if (query?.state.fetchStatus === 'fetching')
    await query.promise?.catch(() => undefined);
}
