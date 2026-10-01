import assert from 'node:assert/strict';
import test from 'node:test';
import { hasDocumentChange } from './documentChange.mjs';

const replacement = { name: 'rules-v2.pdf' };

test('제목과 파일이 그대로면 변경이 없다', () => {
  assert.equal(hasDocumentChange('관리 규약', '관리 규약', null), false);
});

test('앞뒤 공백만 다른 제목은 변경이 없다', () => {
  assert.equal(hasDocumentChange('관리 규약', '  관리 규약  ', null), false);
});

test('제목이 바뀌면 변경이 있다', () => {
  assert.equal(hasDocumentChange('관리 규약', '주차 규약', null), true);
});

test('새 파일을 고르면 제목이 같아도 변경이 있다', () => {
  assert.equal(hasDocumentChange('관리 규약', '관리 규약', replacement), true);
});
