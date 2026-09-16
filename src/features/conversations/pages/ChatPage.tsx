import { Badge } from "@seed-design/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { isApiError, type ApiError } from "../../../shared/api/errors";
import { formatRoomNo } from "../../../shared/ui/formatRoomNo";
import { useRetryCountdown } from "../../../shared/ui/useRetryCountdown";
import { useCreateComplaint } from "../../complaints/api/complaintApi";
import type { ComplaintCreateResponse } from "../../complaints/model/types";
import { useConversationMessages, useSendMessage, useStartConversation } from "../api/conversationQueries";
import { ChatComposer } from "../components/ChatComposer";
import { ComplaintSummaryCard, type ComplaintDraft } from "../components/ComplaintSummaryCard";
import { ConversationMessage, PendingResidentMessage } from "../components/ConversationMessage";
import type { ConversationMessagesResponse } from "../model/types";

// 대화 시작 인사는 서버가 저장하지 않는 클라이언트 고정 문구다.
const GREETING = "불편한 점이나 궁금한 점을 편하게 말씀해 주세요.";

// 받으면 화면의 대화 상태가 서버와 어긋났다는 뜻이라 상세를 다시 받아온다.
const CONVERSATION_STATE_CODES = ["CONVERSATION_CLOSED", "CONVERSATION_AWAITING_CONFIRMATION"];

export function NewChatPage() {
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [input, setInput] = useState("");
  const countdown = useRetryCountdown();
  const [error, setError] = useState<ApiError | null>(null);

  const submit = () => {
    const content = input.trim();
    setError(null);
    startConversation.mutate(content, {
      onSuccess: (created) => navigate(`/resident/conversations/${created.conversationId}`, { replace: true }),
      onError: (caught) => handleSendError(caught, setError, countdown.start),
    });
  };

  return (
    <ChatLayout title="새 대화">
      <div className="chat-body">
        <ConversationMessage message={{ senderType: "ASSISTANT", content: GREETING, createdAt: "" }} />
        {startConversation.isPending && <PendingResidentMessage content={startConversation.variables ?? ""} />}
        {error?.status === 403 && (
          <Callout tone="warning" description="호실에 연결된 입주민만 AI 도우미와 대화할 수 있어요. 관리자에게 받은 초대코드로 먼저 입주 연결을 해 주세요." />
        )}
      </div>
      <ChatComposer
        value={input}
        onChange={setInput}
        onSubmit={submit}
        sending={startConversation.isPending}
        lockedSeconds={countdown.remaining}
        errorMessage={error && error.status !== 403 ? sendErrorMessage(error) : undefined}
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
  const [input, setInput] = useState("");
  const [sendError, setSendError] = useState<ApiError | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintCreateResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pages = messagesQuery.data?.pages;
  const messageCount = pages?.reduce((count, page) => count + page.messages.length, 0) ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messageCount, sendMessage.isPending]);

  if (messagesQuery.isPending) {
    return <ChatLayout title="대화"><div className="skeleton-stack chat-body">{[1, 2, 3].map((item) => <div className="skeleton-row" key={item} />)}</div></ChatLayout>;
  }
  if (messagesQuery.isError) {
    const error = messagesQuery.error;
    if (isApiError(error) && error.status === 403) return <ChatUnavailable title="이 대화에 접근할 수 없어요" />;
    if (isApiError(error) && error.status === 404) return <ChatUnavailable title="대화를 찾을 수 없어요" />;
    return <ChatUnavailable title="대화를 불러오지 못했어요" onRetry={() => messagesQuery.refetch()} />;
  }

  const conversation = messagesQuery.data.pages[0];
  // 페이지는 최신 → 과거 순으로 쌓이므로 뒤집어서 오래된 메시지부터 그린다.
  const messages = [...messagesQuery.data.pages].reverse().flatMap((page) => page.messages);
  const isActive = conversation.conversationStatus === "ACTIVE";
  // 카드는 메시지가 아니라 대화 상태에서 파생돼 응답 최상위로 온다. 카드가 있으면 수집이 끝났다는 뜻이고,
  // 서버가 이 동안 메시지를 받지 않으므로(CONVERSATION_AWAITING_CONFIRMATION) 입력창 대신 카드로 유도한다.
  const summaryCard = conversation.summaryCard;

  const submitMessage = () => {
    setSendError(null);
    sendMessage.mutate(input.trim(), {
      onSuccess: () => setInput(""),
      onError: (caught) => {
        handleSendError(caught, setSendError, countdown.start);
        if (isApiError(caught) && CONVERSATION_STATE_CODES.includes(caught.code ?? "")) messagesQuery.refetch();
      },
    });
  };

  const submitComplaint = (draft: ComplaintDraft) => {
    createComplaint.mutate(
      { conversationId, ...draft, attachmentIds: [] },
      { onSuccess: setCreatedComplaint },
    );
  };

  const complaintError = isApiError(createComplaint.error) ? createComplaint.error : null;

  return (
    <ChatLayout title={conversation.conversationTitle} badge={<ConversationBadge conversation={conversation} />}>
      <div className="chat-body">
        {messagesQuery.hasNextPage ? (
          <ActionButton className="chat-load-more" variant="neutralWeak" size="small" loading={messagesQuery.isFetchingNextPage} onClick={() => messagesQuery.fetchNextPage()}>
            이전 메시지 보기
          </ActionButton>
        ) : (
          <ConversationMessage message={{ senderType: "ASSISTANT", content: GREETING, createdAt: "" }} />
        )}
        {messages.map((message) => (
          <ConversationMessage message={message} key={message.messageId} />
        ))}
        {summaryCard && (
          <ComplaintSummaryCard
            summaryCard={summaryCard}
            actionable={isActive}
            submitting={createComplaint.isPending}
            error={complaintError?.code === "COMPLAINT_ALREADY_CREATED" ? null : complaintError}
            onSubmit={submitComplaint}
          />
        )}
        {sendMessage.isPending && <PendingResidentMessage content={sendMessage.variables ?? ""} />}
        <div ref={bottomRef} />
      </div>
      {!isActive ? (
        <ClosedNotice conversation={conversation} createdComplaint={createdComplaint} alreadyCreated={complaintError?.code === "COMPLAINT_ALREADY_CREATED"} />
      ) : summaryCard ? (
        <Callout
          className="chat-closed"
          tone="informative"
          title="접수 내용을 확인해 주세요"
          description="위 카드의 내용이 맞으면 [이대로 접수]를, 고칠 부분이 있으면 [내용 수정]을 눌러 주세요."
        />
      ) : (
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={submitMessage}
          sending={sendMessage.isPending}
          lockedSeconds={countdown.remaining}
          errorMessage={sendError ? sendErrorMessage(sendError) : undefined}
        />
      )}
    </ChatLayout>
  );
}

function ClosedNotice({ conversation, createdComplaint, alreadyCreated }: {
  conversation: ConversationMessagesResponse;
  createdComplaint: ComplaintCreateResponse | null;
  alreadyCreated: boolean;
}) {
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
  if (conversation.complaintId !== null) {
    return (
      <Callout
        className="chat-closed"
        tone="neutral"
        title={alreadyCreated ? "이미 민원이 접수된 대화예요" : "민원이 접수된 대화예요"}
        description={`현재 처리 상태: ${conversation.statusLabel}. 새로운 문의는 새 대화에서 시작해 주세요.`}
      />
    );
  }
  return <Callout className="chat-closed" tone="neutral" description="종료된 대화예요. 새로운 문의는 새 대화에서 시작해 주세요." />;
}

function ConversationBadge({ conversation }: { conversation: ConversationMessagesResponse }) {
  const tone = conversation.conversationStatus === "ACTIVE" ? "informative" : "neutral";
  return <Badge tone={tone} variant="weak">{conversation.statusLabel}</Badge>;
}

function ChatLayout({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="chat-layout">
      <header className="chat-header">
        <div><p className="eyebrow">AI 생활 도우미</p><h1>{title}</h1></div>
        {badge}
      </header>
      {children}
    </div>
  );
}

function ChatUnavailable({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div className="result-state">
      <h2>{title}</h2>
      <p>{onRetry ? "잠시 후 다시 시도해 주세요." : "대화 목록에서 다시 선택해 주세요."}</p>
      <div className="button-row">
        {onRetry && <ActionButton variant="brandSolid" onClick={onRetry}>다시 시도</ActionButton>}
        <Link to="/resident/conversations"><ActionButton variant="neutralOutline">대화 목록</ActionButton></Link>
      </div>
    </div>
  );
}

function handleSendError(caught: unknown, setError: (error: ApiError) => void, startCountdown: (seconds: number) => void) {
  if (!isApiError(caught)) throw caught;
  setError(caught);
  if (caught.status === 429 && caught.retryAfterSeconds) startCountdown(caught.retryAfterSeconds);
}

function sendErrorMessage(error: ApiError) {
  if (error.status === 400 || error.status === 422) return error.violations[0]?.reason ?? "메시지를 확인해 주세요.";
  if (error.status === 429) return "요청이 너무 많아요. 잠시 후 다시 보내 주세요.";
  if (error.code === "CONVERSATION_CLOSED") return "종료된 대화에는 메시지를 보낼 수 없어요.";
  if (error.code === "CONVERSATION_AWAITING_CONFIRMATION") return "접수 내용을 확인하는 중이에요. 카드에서 접수하거나 내용을 수정해 주세요.";
  if (error.code === "CONVERSATION_BUSY") return "직전 메시지에 답하는 중이에요. 잠시 후 다시 보내 주세요.";
  if (error.status === 403) return "이 대화에 메시지를 보낼 수 없어요.";
  if (error.status === 404) return "대화를 찾을 수 없어요.";
  return "메시지를 보내지 못했어요. 입력한 내용은 그대로 두었으니 다시 전송해 주세요.";
}
