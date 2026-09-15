const timeFormatter = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
const dateFormatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });

/** 서버 LocalDateTime(Asia/Seoul) 문자열을 목록용 짧은 시각으로 표시한다. */
export function formatListTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay ? `오늘 ${timeFormatter.format(date)}` : dateFormatter.format(date);
}

export function formatMessageTime(value: string) {
  return timeFormatter.format(new Date(value));
}
