export const conversationReplyEvent = 'chat-done';
export const conversationReplyFailedEvent = 'chat-error';
export const conversationReplyEvents = [
  conversationReplyEvent,
  conversationReplyFailedEvent,
];

export function parseConversationReply(data) {
  const reply = parseJson(data);
  if (
    !isConversationId(reply?.conversationId) ||
    !Number.isSafeInteger(reply.assistantMessage?.messageId)
  )
    return null;
  return reply;
}

export function parseConversationReplyFailure(data) {
  const failure = parseJson(data);
  if (!isConversationId(failure?.conversationId) || !failure.code) return null;
  return failure;
}

export function isAwaitingReply(messages) {
  return messages.at(-1)?.senderType === 'RESIDENT';
}

export function appendMessages(data, messages, closesAt) {
  if (!data || data.pages.length === 0) return data;
  const saved = new Set(
    data.pages.flatMap((page) =>
      page.messages.map((message) => message.messageId),
    ),
  );
  const added = messages.filter((message) => !saved.has(message.messageId));
  const [latest, ...older] = data.pages;
  return {
    ...data,
    pages: [
      {
        ...latest,
        closesAt: closesAt === undefined ? latest.closesAt : closesAt,
        messages: [...latest.messages, ...added],
      },
      ...older,
    ],
  };
}

function isConversationId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function parseJson(data) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
