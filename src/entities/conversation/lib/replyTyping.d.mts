export const replyTypingIntervalMs: number;
export function characterCount(text: string): number;
export function nextTypedLength(
  typedLength: number,
  textLength: number,
): number;
export function renderableText(
  text: string,
  length: number,
  complete: boolean,
): string;
