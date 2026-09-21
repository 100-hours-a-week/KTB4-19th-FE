/** 호실 번호를 "302호" 형태로 표시한다. 서버 값에 이미 "호"가 붙어 있으면 그대로 쓴다. */
export function formatRoomNo(roomNo: string) {
  return roomNo.endsWith('호') ? roomNo : `${roomNo}호`;
}
