const PHONE_DIGITS = 11;

export function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, PHONE_DIGITS);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length < PHONE_DIGITS)
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function nextPhoneInput(previous, raw, caret) {
  let digits = raw.replace(/\D/g, '');
  let digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, '').length;
  const removedOnlyHyphen =
    raw.length < previous.length &&
    digits === previous.replace(/\D/g, '') &&
    digitsBeforeCaret > 0;
  if (removedOnlyHyphen) {
    digits =
      digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
    digitsBeforeCaret -= 1;
  }
  const value = formatPhoneNumber(digits);
  let position = 0;
  let seen = 0;
  while (position < value.length && seen < digitsBeforeCaret) {
    if (/\d/.test(value[position])) seen += 1;
    position += 1;
  }
  return { value, caret: position };
}
