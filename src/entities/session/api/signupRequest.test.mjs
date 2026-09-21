import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSignupRequest } from './signupRequest.mjs';

test('maps the signup form to the backend DTO and records both required terms', () => {
  assert.deepEqual(
    buildSignupRequest({
      email: '  person@example.com ',
      password: 'Pass!1234',
      passwordConfirm: 'Pass!1234',
      userName: ' 홍길동 ',
      phone: ' 010-1234-5678 ',
      acceptedRequiredTerms: true,
    }),
    {
      email: 'person@example.com',
      password: 'Pass!1234',
      passwordConfirm: 'Pass!1234',
      userName: '홍길동',
      phone: '010-1234-5678',
      agreements: [
        { termsType: 'SERVICE', isAgreed: true },
        { termsType: 'PRIVACY', isAgreed: true },
        { termsType: 'MARKETING', isAgreed: false },
      ],
    },
  );
});

test('sends optional name and phone as null when left blank', () => {
  const request = buildSignupRequest({
    email: 'person@example.com',
    password: 'Pass!1234',
    passwordConfirm: 'Pass!1234',
    userName: ' ',
    phone: '',
    acceptedRequiredTerms: true,
  });

  assert.equal(request.userName, null);
  assert.equal(request.phone, null);
});
