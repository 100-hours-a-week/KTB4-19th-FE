import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPhoneNumber, nextPhoneInput } from './phoneNumber.mjs';

test('adds hyphens as digits are typed in 3-4-4 groups', () => {
  assert.equal(formatPhoneNumber(''), '');
  assert.equal(formatPhoneNumber('010'), '010');
  assert.equal(formatPhoneNumber('0101'), '010-1');
  assert.equal(formatPhoneNumber('0101234'), '010-1234');
  assert.equal(formatPhoneNumber('01012345'), '010-1234-5');
  assert.equal(formatPhoneNumber('01012345678'), '010-1234-5678');
});

test('keeps only digits and stops at 11 digits', () => {
  assert.equal(formatPhoneNumber('010-1234-5678'), '010-1234-5678');
  assert.equal(formatPhoneNumber('010 1234 5678'), '010-1234-5678');
  assert.equal(formatPhoneNumber('010ab1234!5678'), '010-1234-5678');
  assert.equal(formatPhoneNumber('0101234567899'), '010-1234-5678');
});

test('formats pasted numbers and places the caret at the end', () => {
  assert.deepEqual(nextPhoneInput('', '01012345678', 11), {
    value: '010-1234-5678',
    caret: 13,
  });
});

test('moves the caret past an inserted hyphen while typing', () => {
  assert.deepEqual(nextPhoneInput('010', '0101', 4), {
    value: '010-1',
    caret: 5,
  });
});

test('deletes the digit before a hyphen when backspace removes the hyphen', () => {
  assert.deepEqual(nextPhoneInput('010-1234-5678', '010-12345678', 8), {
    value: '010-1235-678',
    caret: 7,
  });
  assert.deepEqual(nextPhoneInput('010-1', '0101', 3), {
    value: '011',
    caret: 2,
  });
});

test('keeps the caret in place when a digit is deleted in the middle', () => {
  assert.deepEqual(nextPhoneInput('010-1234-5678', '010-124-5678', 6), {
    value: '010-1245-678',
    caret: 6,
  });
});
