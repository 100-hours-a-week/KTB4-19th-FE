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


const lineMarker = /^ {0,3}(?:#{1,6} |[-*+] |\d{1,9}[.)] |> )/;
const unfinishedLineMarker = /^ {0,3}(?:#{0,6} ?|[-*+] ?|\d{0,9}(?:[.)] ?)?|> ?)$/;
const inlineMarkers = ['**', '*', '`'];

export function renderableText(text, length, complete) {
  const chars = Array.from(text);
  const spans = [];
  let cutoff = chars.length;
  let offset = 0;
  for (const line of text.split('\n')) {
    const lineChars = Array.from(line);
    const lineEnd = offset + lineChars.length;
    const unfinished = !complete && lineEnd === chars.length;
    if (unfinished && unfinishedLineMarker.test(line)) {
      cutoff = offset;
      break;
    }
    const markerLength = Array.from(line.match(lineMarker)?.[0] ?? '').length;
    if (markerLength > 0)
      spans.push({ start: offset, end: Math.min(offset + markerLength + 1, lineEnd), marker: '' });
    const open = scanInlineMarkers(chars, offset + markerLength, lineEnd, spans);
    if (unfinished && open !== null) cutoff = open;
    offset = lineEnd + 1;
  }
  let renderable = Math.min(length, cutoff);
  let closer = '';
  for (const { start, end, marker } of spans.sort((a, b) => b.start - a.start)) {
    if (renderable <= start || renderable >= end) continue;
    const contentStart = start + marker.length;
    renderable = Math.min(renderable, end - marker.length);
    while (renderable > contentStart && chars[renderable - 1].trim() === '')
      renderable -= 1;
    if (marker && renderable > contentStart) {
      closer = marker;
      break;
    }
    renderable = start;
  }
  return chars.slice(0, renderable).join('') + closer;
}

function scanInlineMarkers(chars, from, to, spans) {
  let open = null;
  let index = from;
  while (index < to) {
    const marker = inlineMarkers.find((candidate) =>
      Array.from(candidate).every((char, i) => chars[index + i] === char),
    );
    if (!marker || (open && open.marker !== marker)) {
      index += 1;
      continue;
    }
    if (open) {
      spans.push({ start: open.start, end: index + marker.length, marker });
      open = null;
    } else if (chars[index + marker.length]?.trim() !== '') {
      open = { marker, start: index };
    }
    index += marker.length;
  }
  return open?.start ?? null;
}
