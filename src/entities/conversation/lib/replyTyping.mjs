export const replyTypingIntervalMs = 20;

const minCharactersPerTick = 3;
const maxTypingMs = 2000;

export function characterCount(text) {
  return Array.from(text).length;
}

export function nextTypedLength(typedLength, textLength) {
  const ticks = Math.floor(maxTypingMs / replyTypingIntervalMs);
  const step = Math.max(minCharactersPerTick, Math.ceil(textLength / ticks));
  return Math.min(textLength, typedLength + step);
}

export function typedText(text, typedLength) {
  return Array.from(text).slice(0, typedLength).join('');
}
