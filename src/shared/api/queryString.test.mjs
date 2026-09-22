import assert from 'node:assert/strict';
import test from 'node:test';
import { toQueryString } from './queryString.mjs';

test('serializes arrays and booleans while excluding empty values', () => {
  assert.equal(
    toQueryString({
      status: ['PENDING', 'DONE'],
      urgentOnly: false,
      page: 0,
      keyword: '',
      missing: undefined,
      blankStatus: ['', ''],
    }),
    '?status=PENDING&status=DONE&urgentOnly=false&page=0',
  );
});
