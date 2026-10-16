import { useEffect, useState } from 'react';
import {
  characterCount,
  nextTypedLength,
  replyTypingIntervalMs,
  typedText,
  type Message,
} from '@/entities/conversation';

export function useReplyTyping(
  awaitingReply: boolean,
  streamingText: string | undefined,
  lastMessage:
    Pick<Message, 'messageId' | 'senderType' | 'content'> | undefined,
) {
  const [animate] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [wasAwaiting, setWasAwaiting] = useState(awaitingReply);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [typedLength, setTypedLength] = useState(0);

  if (wasAwaiting !== awaitingReply) {
    setWasAwaiting(awaitingReply);
    if (awaitingReply) {
      setTypedLength(0);
      setTypingMessageId(null);
    } else if (lastMessage?.senderType === 'ASSISTANT') {
      setTypingMessageId(lastMessage.messageId);
    }
  }

  const typingMessage =
    lastMessage?.messageId === typingMessageId ? lastMessage : undefined;
  const target = awaitingReply
    ? (streamingText ?? '')
    : (typingMessage?.content ?? '');
  const targetLength = characterCount(target);
  const typing = animate && typedLength < targetLength;

  useEffect(() => {
    if (!typing) return;
    const timer = setTimeout(
      () => setTypedLength((length) => nextTypedLength(length, targetLength)),
      replyTypingIntervalMs,
    );
    return () => clearTimeout(timer);
  }, [typing, typedLength, targetLength]);

  const shownText = animate ? typedText(target, typedLength) : target;
  return {
    pendingText: target || undefined,
    typingMessageId: typing && typingMessage ? typingMessage.messageId : null,
    typedText: shownText,
  };
}
