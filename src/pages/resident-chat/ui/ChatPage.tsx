import { Badge } from '@seed-design/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import {
  ConversationMessage,
  PendingResidentMessage,
  closedStatusLabel,
  closingCheckIntervalMs,
  isClosedAt,
  latestMessageId,
  orderedMessages,
  useConversationMessages,
  useOlderMessages,
  type ConversationMessagesResponse,
} from '@/entities/conversation';
import {
  ComplaintSummaryCard,
  residentPhotos,
  useCreateComplaint,
  type ComplaintCreateResponse,
  type ComplaintDraft,
} from '@/features/create-complaint';
import {
  ChatComposer,
  ImageUploadError,
  releaseImages,
  useSendMessage,
  useStartConversation,
  type SelectedImage,
} from '@/features/send-message';
import { isApiError, type ApiError } from '@/shared/api';
import { formatRoomNo, useNow, useRetryCountdown } from '@/shared/lib';

// 대화 시작 인사는 서버가 저장하지 않는 클라이언트 고정 문구다.
const greeting = '불편한 점이나 궁금한 점을 편하게 말씀해 주세요.';

type SendError = ApiError | ImageUploadError;

// 받으면 화면의 대화 상태가 서버와 어긋났다는 뜻이라 상세를 다시 받아온다.
const conversationStateCodes = [
  'CONVERSATION_CLOSED',
  'CONVERSATION_AWAITING_CONFIRMATION',
];

export function NewChatPage() {
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [input, setInput] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const countdown = useRetryCountdown();
  const [error, setError] = useState<SendError | null>(null);
  const noRoom = isApiError(error) && error.status === 403;

  const submit = () => {
    setError(null);
    startConversation.mutate(
      { content: input.trim(), images },
      {
        onSuccess: (created) => {
          releaseImages(images);
          navigate(`/resident/conversations/${created.conversationId}`, {
            replace: true,
          });
        },
        onError: (caught) => handleSendError(caught, setError, countdown.start),
      },
    );
  };

  return (
    <ChatLayout title="새 대화">
      <div className="chat-body">
        <ConversationMessage
          message={{
            senderType: 'ASSISTANT',
            content: greeting,
            createdAt: '',
          }}
        />
        {startConversation.isPending && (
          <PendingResidentMessage
            content={startConversation.variables?.content ?? ''}
            imageCount={startConversation.variables?.images.length}
          />
        )}
        {noRoom && (
          <Callout
            tone="warning"
            description="호실에 연결된 입주민만 AI 도우미와 대화할 수 있어요. 관리자에게 받은 초대코드로 먼저 입주 연결을 해 주세요."
          />
        )}
      </div>
      <ChatComposer
        value={input}
        onChange={setInput}
        images={images}
        onImagesChange={setImages}
        onSubmit={submit}
        sending={startConversation.isPending}
        lockedSeconds={countdown.remaining}
        errorMessage={error && !noRoom ? sendErrorMessage(error) : undefined}
      />
    </ChatLayout>
  );
}

export function ChatPage() {
  const { conversationId } = useParams();
  const id = Number(conversationId);
  if (!Number.isInteger(id) || id < 1) {
    return <ChatUnavailable title="대화를 찾을 수 없어요" />;
  }
  return <ConversationChat key={id} conversationId={id} />;
}

function ConversationChat({ conversationId }: { conversationId: number }) {
  const messagesQuery = useConversationMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const createComplaint = useCreateComplaint();
  const countdown = useRetryCountdown();
  const now = useNow(closingCheckIntervalMs);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [sendError, setSendError] = useState<SendError | null>(null);
  const [createdComplaint, setCreatedComplaint] =
    useState<ComplaintCreateResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { olderMessagesRef, loadOlderMessages } =
    useOlderMessages(messagesQuery);

  const latestId = latestMessageId(messagesQuery.data?.pages);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [latestId, sendMessage.isPending]);

  if (messagesQuery.isPending) {
    return (
      <ChatLayout title="대화">
        <div className="skeleton-stack chat-body">
          {[1, 2, 3].map((item) => (
            <div className="skeleton-row" key={item} />
          ))}
        </div>
      </ChatLayout>
    );
  }
  if (messagesQuery.isError) {
    const error = messagesQuery.error;
    if (isApiError(error) && error.status === 403)
      return <ChatUnavailable title="이 대화에 접근할 수 없어요" />;
    if (isApiError(error) && error.status === 404)
      return <ChatUnavailable title="대화를 찾을 수 없어요" />;
    return (
      <ChatUnavailable
        title="대화를 불러오지 못했어요"
        onRetry={() => messagesQuery.refetch()}
      />
    );
  }

  const conversation = messagesQuery.data.pages[0];
  const messages = orderedMessages(messagesQuery.data.pages);
  const closedByIdle =
    !sendMessage.isPending && isClosedAt(conversation.closesAt, now);
  const isActive =
    conversation.conversationStatus === 'ACTIVE' && !closedByIdle;
  // 접수 확인 카드는 SUMMARY_CARD 메시지에 실려 온다. 접수 후에도 기록으로 남기되 버튼은 진행 중일 때만 누를 수 있다.
  const summaryCard = [...messages]
    .reverse()
    .find((message) => message.messageType === 'SUMMARY_CARD')?.summaryCard;
  // 마지막 메시지가 카드면 서버가 메시지를 받지 않으므로(CONVERSATION_AWAITING_CONFIRMATION) 입력창 대신 카드로 유도한다.
  const awaitingConfirmation =
    isActive && messages.at(-1)?.messageType === 'SUMMARY_CARD';
  const isQuestion = summaryCard?.complaintType === 'QA';

  const submitMessage = () => {
    setSendError(null);
    sendMessage.mutate(
      { content: input.trim(), images },
      {
        onSuccess: () => {
          setInput('');
          releaseImages(images);
          setImages([]);
        },
        onError: (caught) => {
          handleSendError(caught, setSendError, countdown.start);
          if (
            isApiError(caught) &&
            conversationStateCodes.includes(caught.code ?? '')
          )
            messagesQuery.refetch();
        },
      },
    );
  };

  const submitComplaint = (draft: ComplaintDraft) => {
    createComplaint.mutate(
      { conversationId, ...draft, attachmentIds: [] },
      { onSuccess: setCreatedComplaint },
    );
  };

  const complaintError = isApiError(createComplaint.error)
    ? createComplaint.error
    : null;

  return (
    <ChatLayout
      title={conversation.conversationTitle}
      badge={
        <ConversationBadge
          active={isActive}
          label={closedByIdle ? closedStatusLabel : conversation.statusLabel}
        />
      }
    >
      <div className="chat-body">
        {messagesQuery.hasNextPage ? (
          <div className="chat-load-more" ref={olderMessagesRef}>
            {messagesQuery.isFetchNextPageError ? (
              <ActionButton
                variant="neutralWeak"
                size="small"
                onClick={loadOlderMessages}
              >
                이전 메시지 다시 불러오기
              </ActionButton>
            ) : (
              messagesQuery.isFetchingNextPage && (
                <div className="skeleton-row" aria-label="불러오는 중" />
              )
            )}
          </div>
        ) : (
          <ConversationMessage
            message={{
              senderType: 'ASSISTANT',
              content: greeting,
              createdAt: '',
            }}
          />
        )}
        {messages.map((message) => (
          <ConversationMessage message={message} key={message.messageId} />
        ))}
        {summaryCard && (
          <ComplaintSummaryCard
            summaryCard={summaryCard}
            actionable={isActive}
            submitting={createComplaint.isPending}
            error={
              complaintError?.code === 'COMPLAINT_ALREADY_CREATED'
                ? null
                : complaintError
            }
            photos={residentPhotos(messages)}
            onSubmit={submitComplaint}
          />
        )}
        {sendMessage.isPending && (
          <PendingResidentMessage
            content={sendMessage.variables?.content ?? ''}
            imageCount={sendMessage.variables?.images.length}
          />
        )}
      </div>
      {!isActive ? (
        <ClosedNotice
          conversation={conversation}
          createdComplaint={createdComplaint}
          alreadyCreated={complaintError?.code === 'COMPLAINT_ALREADY_CREATED'}
          isQuestion={isQuestion}
        />
      ) : awaitingConfirmation ? (
        <Callout
          className="chat-closed"
          tone="informative"
          title={
            isQuestion ? '질문을 확인해 주세요' : '접수 내용을 확인해 주세요'
          }
          description={
            isQuestion
              ? '위 질문이 맞으면 [질문 전달]을, 고칠 부분이 있으면 [질문 수정]을 눌러 주세요.'
              : '위 카드의 내용이 맞으면 [이대로 접수]를, 고칠 부분이 있으면 [내용 수정]을 눌러 주세요.'
          }
        />
      ) : (
        <>
          <ChatComposer
            value={input}
            onChange={setInput}
            images={images}
            onImagesChange={setImages}
            onSubmit={submitMessage}
            sending={sendMessage.isPending}
            lockedSeconds={countdown.remaining}
            errorMessage={sendError ? sendErrorMessage(sendError) : undefined}
          />
        </>
      )}
      <div className="chat-end" ref={bottomRef} />
    </ChatLayout>
  );
}

function ClosedNotice({
  conversation,
  createdComplaint,
  alreadyCreated,
  isQuestion,
}: {
  conversation: ConversationMessagesResponse;
  createdComplaint: ComplaintCreateResponse | null;
  alreadyCreated: boolean;
  isQuestion: boolean;
}) {
  if (createdComplaint && isQuestion) {
    return (
      <Callout
        className="chat-closed"
        tone="positive"
        title="질문이 전달됐어요"
        description="관리자가 답변을 남기면 민원 목록에서 확인할 수 있어요."
      />
    );
  }
  if (createdComplaint) {
    return (
      <Callout
        className="chat-closed"
        tone="positive"
        title="민원이 접수됐어요"
        description={`${createdComplaint.buildingName} ${formatRoomNo(createdComplaint.roomNo)} · ${createdComplaint.title} · ${createdComplaint.statusLabel}. 처리 상태가 바뀌면 알려드릴게요.`}
      />
    );
  }
  if (conversation.conversationStatus === 'COMPLAINT_CREATED') {
    return (
      <Callout
        className="chat-closed"
        tone="neutral"
        title={closedTitle(isQuestion, alreadyCreated)}
        description={
          isQuestion
            ? '관리자 답변은 민원 목록에서 확인해 주세요. 새로운 문의는 새 대화에서 시작해 주세요.'
            : '처리 상태는 민원 목록에서 확인해 주세요. 새로운 문의는 새 대화에서 시작해 주세요.'
        }
      />
    );
  }
  return (
    <Callout
      className="chat-closed"
      tone="neutral"
      description="마지막 대화 후 5분이 지나 종료된 대화예요. 새로운 문의는 새 대화에서 시작해 주세요."
    />
  );
}

function ConversationBadge({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <Badge tone={active ? 'informative' : 'neutral'} variant="weak">
      {label}
    </Badge>
  );
}

function ChatLayout({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="chat-layout">
      <header className="chat-header">
        <div>
          <p className="eyebrow">AI 생활 도우미</p>
          <h1>{title}</h1>
        </div>
        {badge}
      </header>
      {children}
    </div>
  );
}

function ChatUnavailable({
  title,
  onRetry,
}: {
  title: string;
  onRetry?: () => void;
}) {
  return (
    <div className="result-state">
      <h2>{title}</h2>
      <p>
        {onRetry
          ? '잠시 후 다시 시도해 주세요.'
          : '대화 목록에서 다시 선택해 주세요.'}
      </p>
      <div className="button-row">
        {onRetry && (
          <ActionButton variant="brandSolid" onClick={onRetry}>
            다시 시도
          </ActionButton>
        )}
        <Link to="/resident/conversations">
          <ActionButton variant="neutralOutline">대화 목록</ActionButton>
        </Link>
      </div>
    </div>
  );
}

function handleSendError(
  caught: unknown,
  setError: (error: SendError) => void,
  startCountdown: (seconds: number) => void,
) {
  if (caught instanceof ImageUploadError) return setError(caught);
  if (!isApiError(caught)) throw caught;
  setError(caught);
  if (caught.status === 429 && caught.retryAfterSeconds)
    startCountdown(caught.retryAfterSeconds);
}

function sendErrorMessage(error: SendError) {
  if (error instanceof ImageUploadError)
    return '사진을 올리지 못했어요. 입력한 내용과 사진은 그대로 두었으니 다시 전송해 주세요.';
  if (error.status === 400 || error.status === 422)
    return error.violations[0]?.reason ?? '메시지를 확인해 주세요.';
  if (error.status === 429)
    return '요청이 너무 많아요. 잠시 후 다시 보내 주세요.';
  if (error.code === 'CONVERSATION_CLOSED')
    return '종료된 대화에는 메시지를 보낼 수 없어요.';
  if (error.code === 'CONVERSATION_AWAITING_CONFIRMATION')
    return '접수 내용을 확인하는 중이에요. 카드에서 접수하거나 내용을 수정해 주세요.';
  if (error.code === 'CONVERSATION_BUSY')
    return '직전 메시지에 답하는 중이에요. 잠시 후 다시 보내 주세요.';
  if (error.status === 403) return '이 대화에 메시지를 보낼 수 없어요.';
  if (error.status === 404) return '대화를 찾을 수 없어요.';
  return '메시지를 보내지 못했어요. 입력한 내용은 그대로 두었으니 다시 전송해 주세요.';
}

function closedTitle(isQuestion: boolean, alreadyCreated: boolean) {
  if (isQuestion)
    return alreadyCreated
      ? '이미 질문이 전달된 대화예요'
      : '질문이 전달된 대화예요';
  return alreadyCreated
    ? '이미 민원이 접수된 대화예요'
    : '민원이 접수된 대화예요';
}
