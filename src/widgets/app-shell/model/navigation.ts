import {
  IconBuilding2Line,
  IconDocumentLine,
  IconDocumentPlusLine,
  IconDot3HorizontalChatbubbleLeftLine,
  IconHouseLine,
  IconPersonLine,
  IconSparkle2Line,
} from "@karrotmarket/react-monochrome-icon";

export const managerNav = [
  ["/manager", "홈", IconHouseLine],
  ["/manager/rooms", "호실", IconBuilding2Line],
  ["/manager/complaints", "민원", IconDocumentLine],
  ["/manager/documents", "운영규칙", IconDocumentPlusLine],
  ["/manager/insights", "AI 인사이트", IconSparkle2Line],
  ["/manager/mypage", "마이", IconPersonLine],
] as const;

export const residentNav = [
  ["/resident", "홈", IconHouseLine],
  ["/resident/conversations", "AI 대화", IconDot3HorizontalChatbubbleLeftLine],
  ["/resident/complaints", "민원", IconDocumentLine],
  ["/resident/mypage", "마이", IconPersonLine],
] as const;
