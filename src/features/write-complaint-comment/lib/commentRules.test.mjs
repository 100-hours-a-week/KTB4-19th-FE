import assert from 'node:assert/strict';
import test from 'node:test';
import { commentLabel, normalizeComment } from './commentRules.mjs';

test('QA 코멘트는 답변으로 표시한다', () => {
  assert.equal(commentLabel('QA'), '답변');
});

test('일반 민원 코멘트는 처리 내용으로 표시한다', () => {
  assert.equal(commentLabel('COMPLAINT'), '처리 내용');
});

test('유형이 없는 배포 전 민원은 처리 내용으로 표시한다', () => {
  assert.equal(commentLabel(null), '처리 내용');
});

test('코멘트 앞뒤 공백은 지운다', () => {
  assert.equal(normalizeComment('  배관 교체 완료  '), '배관 교체 완료');
});

test('공백만 입력한 코멘트는 저장하지 않는다', () => {
  assert.equal(normalizeComment('   '), null);
});
