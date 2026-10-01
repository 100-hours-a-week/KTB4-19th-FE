export function hasDocumentChange(savedTitle, title, replacement) {
  return title.trim() !== savedTitle || replacement !== null;
}
