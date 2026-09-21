import assert from 'node:assert/strict';
import test from 'node:test';
import { emailAvailabilityFeedback } from './emailAvailability.mjs';

test('reports an available email as success', () => {
  assert.deepEqual(emailAvailabilityFeedback({ isAvailable: true }), {
    message: '사용 가능한 이메일입니다.',
    tone: 'positive',
  });
});

test('reports a duplicate email as warning', () => {
  assert.deepEqual(emailAvailabilityFeedback({ isAvailable: false }), {
    message: '이미 사용 중인 이메일입니다.',
    tone: 'critical',
  });
});

test('reports API failures without claiming the address is available', () => {
  assert.deepEqual(
    emailAvailabilityFeedback({ error: '이메일을 확인하지 못했어요.' }),
    {
      message: '이메일을 확인하지 못했어요.',
      tone: 'critical',
    },
  );
});
