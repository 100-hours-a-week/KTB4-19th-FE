export const commentMaxLength = 200;

export function commentLabel(complaintType) {
  return complaintType === 'QA' ? '답변' : '처리 내용';
}

export function normalizeComment(text) {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
}
