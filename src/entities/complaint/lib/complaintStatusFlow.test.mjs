import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canChangeComplaintStatus,
  nextComplaintStatus,
} from './complaintStatusFlow.mjs';

test('처리전 민원의 다음 상태는 처리중이다', () => {
  assert.equal(nextComplaintStatus('PENDING'), 'IN_PROGRESS');
});

test('처리중 민원의 다음 상태는 완료다', () => {
  assert.equal(nextComplaintStatus('IN_PROGRESS'), 'DONE');
});

test('완료된 민원은 다음 상태가 없다', () => {
  assert.equal(nextComplaintStatus('DONE'), null);
});

test('바로 다음 상태로만 바꿀 수 있다', () => {
  assert.equal(canChangeComplaintStatus('PENDING', 'IN_PROGRESS'), true);
  assert.equal(canChangeComplaintStatus('IN_PROGRESS', 'DONE'), true);
});

test('처리전에서 완료로 건너뛸 수 없다', () => {
  assert.equal(canChangeComplaintStatus('PENDING', 'DONE'), false);
});

test('이전 상태로 되돌릴 수 없다', () => {
  assert.equal(canChangeComplaintStatus('IN_PROGRESS', 'PENDING'), false);
  assert.equal(canChangeComplaintStatus('DONE', 'IN_PROGRESS'), false);
  assert.equal(canChangeComplaintStatus('DONE', 'PENDING'), false);
});

test('현재 상태를 다시 고르면 바뀌지 않는다', () => {
  assert.equal(canChangeComplaintStatus('IN_PROGRESS', 'IN_PROGRESS'), false);
});
