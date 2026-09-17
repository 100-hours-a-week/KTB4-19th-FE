import { apiRequest } from "@/shared/api";
import type {
  ContentRequest,
  ConversationCreateResponse,
  ConversationListResponse,
  ConversationMessagesResponse,
  MessageSendResponse,
} from "../model/types";

const BASE = "/residents/me/conversations";

export const conversationApi = {
  list: (params: { keyword?: string; cursor?: string; size?: number }) =>
    apiRequest<ConversationListResponse>(BASE, { query: params }),
  start: (request: ContentRequest) =>
    apiRequest<ConversationCreateResponse>(BASE, { method: "POST", body: request }),
  messages: (conversationId: number, params: { cursor?: number; size?: number }) =>
    apiRequest<ConversationMessagesResponse>(`${BASE}/${conversationId}/messages`, { query: params }),
  send: (conversationId: number, request: ContentRequest) =>
    apiRequest<MessageSendResponse>(`${BASE}/${conversationId}/messages`, { method: "POST", body: request }),
};
