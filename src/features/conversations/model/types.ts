export type SenderType = "RESIDENT" | "MANAGER" | "ASSISTANT";
// ERD Messages.message_type과 동일하다. 접수 확인 카드는 메시지 종류가 아니라 대화 상태에서 파생된다.
export type MessageType = "TEXT" | "IMAGE";
export type ConversationType = "INQUIRY" | "COMPLAINT";
export type ConversationStatus = "ACTIVE" | "RESOLVED" | "COMPLAINT_CREATED";

export type Attachment = {
  attachmentId: number;
  fileUrl: string | null;
  seq: number;
};

/**
 * 접수 확인 카드. 항목 순서는 위치 → 시점 → 증상 → 사진이고 값이 없으면 null이다.
 *
 * 메시지에 붙지 않고 응답 최상위에 실린다. 존재하면 수집이 끝났다는 뜻이라
 * 카드를 띄우는 조건이자 입력창을 잠그는 조건이다.
 */
export type SummaryCard = {
  location: string | null;
  /** ISO-8601 오프셋 시각. 표시할 때 포맷해야 한다. */
  occurredTime: string | null;
  symptom: string | null;
  attachmentCount: number;
};

export type Message = {
  messageId: number;
  senderType: SenderType;
  messageType: MessageType;
  content: string;
  attachments: Attachment[];
  createdAt: string;
};

export type ContentRequest = {
  content: string;
  attachmentIds?: number[];
};

export type ConversationCreateResponse = {
  conversationId: number;
  conversationType: ConversationType;
  conversationStatus: ConversationStatus;
  conversationTitle: string;
  message: Message;
  assistantMessage: Message;
  /** 수집이 끝난 턴에만 내려온다. */
  summaryCard?: SummaryCard;
};

export type MessageSendResponse = Message & {
  conversationId: number;
  assistantMessage: Message;
  /** 수집이 끝난 턴에만 내려온다. */
  summaryCard?: SummaryCard;
};

export type ConversationListItem = {
  conversationId: number;
  conversationTitle: string;
  conversationType: ConversationType;
  statusCode: string;
  statusLabel: string;
  lastMessageAt: string | null;
};

export type ConversationListResponse = {
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  conversations: ConversationListItem[];
};

export type ConversationMessagesResponse = {
  conversationId: number;
  conversationTitle: string;
  conversationType: ConversationType;
  conversationStatus: ConversationStatus;
  statusCode: string;
  statusLabel: string;
  complaintId: number | null;
  hasNext: boolean;
  nextCursor: number | null;
  /** 오래된 순 */
  messages: Message[];
  /** 접수 전이고 수집이 끝난 대화라면 다시 열어도 그대로 내려온다. */
  summaryCard?: SummaryCard;
};
