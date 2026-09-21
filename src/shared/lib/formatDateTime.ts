const kst = 'Asia/Seoul';

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
});

/** 서버 LocalDateTime(Asia/Seoul) 문자열을 목록용 짧은 시각으로 표시한다. */
export function formatListTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? `오늘 ${timeFormatter.format(date)}`
    : dateFormatter.format(date);
}

export function formatMessageTime(value: string) {
  return timeFormatter.format(new Date(value));
}

// 발생 시점은 서버가 ISO-8601 오프셋 시각으로 준다. "어제 저녁"은 말한 날 기준이라
// 시간이 지나면 뜻이 달라지므로 절대 시각으로 주고받고, 표시할 때만 사람이 읽는 형태로 바꾼다.
const occurredFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: kst,
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const kstWallClock = new Intl.DateTimeFormat('en-CA', {
  timeZone: kst,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** 발생 시점을 카드/상세에 표시할 문구로 바꾼다. 시각이 아니면 받은 값을 그대로 보여준다. */
export function formatOccurredTime(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return occurredFormatter.format(date);
}

/** datetime-local 입력이 쓰는 KST 벽시계 문자열(YYYY-MM-DDTHH:mm)로 바꾼다. */
export function toDateTimeLocalValue(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Map(
    kstWallClock.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}T${parts.get('hour')}:${parts.get('minute')}`;
}

/** datetime-local 입력값을 서버가 받는 ISO-8601로 되돌린다. 한국은 서머타임이 없어 오프셋이 항상 +09:00이다. */
export function fromDateTimeLocalValue(value: string) {
  return value ? `${value}:00+09:00` : null;
}
