export type SenderType = "RESIDENT" | "MANAGER" | "ASSISTANT";
// ERD Messages.message_type과 동일하다. SUMMARY_CARD 메시지에만 접수 확인 카드(summaryCard)가 붙는다.
export type MessageType = "TEXT" | "IMAGE" | "SUMMARY_CARD";
export type ConversationType = "INQUIRY" | "COMPLAINT";
export type ConversationStatus = "ACTIVE" | "RESOLVED" | "COMPLAINT_CREATED";

export type Attachment = {
  attachmentId: number;
  fileUrl: string | null;
  seq: number;
};

/**
 * 접수 확인 카드. 항목 순서는 위치 → 시점 → 증상 → 사진이고 값이 없으면 null이다.
 * SUMMARY_CARD 타입의 AI 메시지에 실린다.
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
  /** messageType이 SUMMARY_CARD일 때만 내려온다. */
  summaryCard?: SummaryCard;
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
};

export type MessageSendResponse = Message & {
  conversationId: number;
  assistantMessage: Message;
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
  hasNext: boolean;
  /** 다음 목록을 요청할 때 그대로 돌려준다. 내용을 해석하지 않는다. */
  nextCursor: string | null;
  /** 최근 메시지 순 */
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
};
