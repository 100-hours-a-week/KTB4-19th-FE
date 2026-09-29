import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSignupDraft, toSignupDraft } from './signupDraft.mjs';

const draft = {
  email: 'resident@zipsai.com',
  userName: '박입주',
  phone: '010-1234-5678',
  emailAvailable: true,
  acceptedServiceTerms: true,
  acceptedPrivacyTerms: false,
};

test('저장한 입력값을 그대로 복원한다', () => {
  assert.deepEqual(parseSignupDraft(toSignupDraft(draft)), draft);
});

test('비밀번호는 저장하지 않는다', () => {
  const saved = toSignupDraft({
    ...draft,
    password: 'Asdf!12345',
    passwordConfirm: 'Asdf!12345',
  });

  assert.equal(saved.includes('Asdf!12345'), false);
});

test('저장된 값이 없으면 복원하지 않는다', () => {
  assert.equal(parseSignupDraft(null), null);
});

test('깨진 값이면 복원하지 않는다', () => {
  assert.equal(parseSignupDraft('{broken'), null);
});
