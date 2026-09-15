export type SenderType = "RESIDENT" | "MANAGER" | "ASSISTANT";
export type MessageType = "TEXT" | "IMAGE" | "SUMMARY_CARD";
export type ConversationType = "INQUIRY" | "COMPLAINT";
export type ConversationStatus = "ACTIVE" | "RESOLVED" | "COMPLAINT_CREATED";

export type Attachment = {
  attachmentId: number;
  fileUrl: string | null;
  seq: number;
};

/** 항목 순서는 위치 → 시점 → 증상 → 사진. 값이 없으면 null. */
export type SummaryCard = {
  location: string | null;
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

export type MessageSendResponse = Omit<Message, "summaryCard"> & {
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
};
