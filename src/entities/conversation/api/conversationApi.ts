import { apiRequest } from '@/shared/api';
import type {
  ContentRequest,
  ConversationCreateResponse,
  ConversationListResponse,
  ConversationMessagesResponse,
  ConversationStatusUpdateResponse,
  MessageSendResponse,
} from '../model/types';

const conversationBase = '/residents/me/conversations';

export const conversationApi = {
  list: (params: { keyword?: string; cursor?: string; size?: number }) =>
    apiRequest<ConversationListResponse>(conversationBase, { query: params }),
  start: (request: ContentRequest) =>
    apiRequest<ConversationCreateResponse>(conversationBase, {
      method: 'POST',
      body: request,
    }),
  messages: (
    conversationId: number,
    params: { cursor?: number; size?: number },
  ) =>
    apiRequest<ConversationMessagesResponse>(
      `${conversationBase}/${conversationId}/messages`,
      { query: params },
    ),
  resolve: (conversationId: number) =>
    apiRequest<ConversationStatusUpdateResponse>(
      `${conversationBase}/${conversationId}`,
      {
        method: 'PATCH',
        body: { conversationStatus: 'RESOLVED' },
      },
    ),
  send: (conversationId: number, request: ContentRequest) =>
    apiRequest<MessageSendResponse>(
      `${conversationBase}/${conversationId}/messages`,
      { method: 'POST', body: request },
    ),
};
