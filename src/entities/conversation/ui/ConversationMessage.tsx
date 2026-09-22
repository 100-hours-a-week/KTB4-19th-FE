import type { ReactNode } from 'react';
import { formatMessageTime } from '@/shared/lib';
import type { Message } from '../model/types';

export function ConversationMessage({
  message,
  children,
}: {
  message: Pick<Message, 'senderType' | 'content' | 'createdAt'> &
    Partial<Pick<Message, 'attachments'>>;
  children?: ReactNode;
}) {
  const isResident = message.senderType === 'RESIDENT';
  const images = (message.attachments ?? []).filter(
    (attachment) => attachment.fileUrl,
  );
  return (
    <div className={`message ${isResident ? 'resident' : 'assistant'}`}>
      {!isResident && <span className="message-name">집사이 AI</span>}
      {message.content && <p>{message.content}</p>}
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
        <time className="message-time" dateTime={message.createdAt}>
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
