import type { MessagesData } from '../api/conversationQueries';
import type {
  ConversationReply,
  ConversationReplyFailure,
  Message,
} from '../model/types';

export const conversationReplyEvent: 'chat-done';
export const conversationReplyFailedEvent: 'chat-error';
export const conversationReplyEvents: string[];
export function parseConversationReply(data: string): ConversationReply | null;
export function parseConversationReplyFailure(
  data: string,
): ConversationReplyFailure | null;
export function isAwaitingReply(
  messages: Pick<Message, 'senderType'>[],
): boolean;
export function appendMessages(
  data: MessagesData | undefined,
  messages: Message[],
  closesAt?: string | null,
): MessagesData | undefined;
