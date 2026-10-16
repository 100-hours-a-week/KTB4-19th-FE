import type { ReactNode } from 'react';
import { formatMessageTime } from '@/shared/lib';
import type { Message } from '../model/types';

export function ConversationMessage({
  message,
  typedContent,
  children,
}: {
  message: Pick<Message, 'senderType' | 'content' | 'createdAt'> &
    Partial<Pick<Message, 'attachments'>>;
  typedContent?: string;
  children?: ReactNode;
}) {
  const typing = typedContent !== undefined;
  const isResident = message.senderType === 'RESIDENT';
  const images = (message.attachments ?? []).filter(
    (attachment) => attachment.fileUrl,
  );
  return (
    <div className={`message ${isResident ? 'resident' : 'assistant'}`}>
      {!isResident && <span className="message-name">zipsAI</span>}
      {message.content &&
        (typing ? (
          <TypingText text={message.content} typedText={typedContent} />
        ) : (
          <p>{message.content}</p>
        ))}
      {images.length > 0 && (
        <div className="message-images">
          {images.map((attachment) => (
            <a
              href={attachment.fileUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              key={attachment.attachmentId}
            >
              <img
                src={attachment.fileUrl ?? undefined}
                alt={`첨부 사진 ${attachment.seq}`}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
      {children}
      {message.createdAt && (
        <time
          className={`message-time${typing ? ' message-time--reserved' : ''}`}
          dateTime={message.createdAt}
        >
          {formatMessageTime(message.createdAt)}
        </time>
      )}
    </div>
  );
}

export function PendingResidentMessage({
  content,
  imageCount = 0,
}: {
  content: string;
  imageCount?: number;
}) {
  return (
    <div className="message resident message--pending" aria-live="polite">
      {content && <p>{content}</p>}
      <span className="message-time">
        {imageCount > 0 ? `사진 ${imageCount}장과 함께 전송 중` : '전송 중'}
      </span>
    </div>
  );
}

export function PendingAssistantMessage({
  text,
  typedText,
}: {
  text?: string;
  typedText: string;
}) {
  if (text)
    return (
      <div className="message assistant">
        <span className="message-name">zipsAI</span>
        <TypingText text={text} typedText={typedText} />
        <span className="message-time message-time--reserved">&nbsp;</span>
      </div>
    );
  return (
    <div className="message assistant message--pending" aria-live="polite">
      <span className="message-name">zipsAI</span>
      <p>답변을 준비하고 있어요</p>
    </div>
  );
}

function TypingText({ text, typedText }: { text: string; typedText: string }) {
  return (
    <p className="message-typing">
      <span className="message-typing-full" aria-hidden="true">
        {text}
      </span>
      <span>{typedText}</span>
    </p>
  );
}
