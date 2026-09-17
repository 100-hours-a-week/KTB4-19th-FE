/**
 * 이메일 확인 API 결과를 폼에 보여줄 짧은 안내 문구로 바꾼다.
 * @param {{ isAvailable?: boolean, error?: string }} result
 */
export function emailAvailabilityFeedback(result) {
  if (result.error) return { message: result.error, tone: "critical" };
  return result.isAvailable
    ? { message: "사용 가능한 이메일입니다.", tone: "positive" }
    : { message: "이미 사용 중인 이메일입니다.", tone: "critical" };
}
