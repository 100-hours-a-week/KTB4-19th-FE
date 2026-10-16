export const replyTypingIntervalMs: number;
export function characterCount(text: string): number;
export function nextTypedLength(
  typedLength: number,
  textLength: number,
): number;
export function typedText(text: string, typedLength: number): string;
