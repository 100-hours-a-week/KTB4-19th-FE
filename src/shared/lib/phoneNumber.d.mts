export function formatPhoneNumber(value: string): string;

export function nextPhoneInput(
  previous: string,
  raw: string,
  caret: number,
): { value: string; caret: number };
