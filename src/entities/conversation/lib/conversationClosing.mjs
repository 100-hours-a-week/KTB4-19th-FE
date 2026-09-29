export const closingCheckIntervalMs = 10_000;
export const closedStatusLabel = '대화 종료';

export function isClosedAt(closesAt, now) {
  return closesAt !== null && new Date(closesAt).getTime() <= now;
}
