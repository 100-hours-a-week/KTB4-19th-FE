import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManagerProfileRequest } from './managerProfile.mjs';

test('builds the profile patch with required terms and optional marketing consent', () => {
  assert.deepEqual(
    buildManagerProfileRequest({
      userName: ' 김관리 ',
      phone: '01012345678',
      marketingAgreed: false,
    }),
    {
      userName: '김관리',
      phone: '01012345678',
      agreements: [
        { termsType: 'SERVICE', isAgreed: true },
        { termsType: 'PRIVACY', isAgreed: true },
        { termsType: 'MARKETING', isAgreed: false },
      ],
    },
  );
});
