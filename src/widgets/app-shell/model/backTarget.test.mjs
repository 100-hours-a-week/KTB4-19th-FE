import assert from 'node:assert/strict';
import test from 'node:test';
import { backTarget } from './backTarget.mjs';

test('채팅방과 새 대화는 대화 목록으로 돌아간다', () => {
  assert.equal(
    backTarget('/resident/conversations/12').path,
    '/resident/conversations',
  );
  assert.equal(
    backTarget('/resident/conversations/new').path,
    '/resident/conversations',
  );
});

test('상세 화면은 각자의 목록으로 돌아간다', () => {
  assert.equal(
    backTarget('/resident/complaints/3').path,
    '/resident/complaints',
  );
  assert.equal(backTarget('/manager/rooms/7').path, '/manager/rooms');
  assert.equal(backTarget('/manager/complaints/3').path, '/manager/complaints');
  assert.equal(backTarget('/manager/documents/5').path, '/manager/documents');
  assert.equal(backTarget('/manager/documents/new').path, '/manager/documents');
});

test('알림은 홈으로 돌아간다', () => {
  assert.equal(backTarget('/resident/notifications').path, '/resident');
  assert.equal(backTarget('/manager/notifications').path, '/manager');
});

test('관리자 대화 원본만 이전 화면 기록을 우선한다', () => {
  assert.deepEqual(backTarget('/manager/conversations/9'), {
    path: '/manager/complaints',
    preferHistory: true,
  });
  assert.equal(backTarget('/manager/complaints/3').preferHistory, false);
});

test('하단 메뉴에 있는 화면에는 돌아가기가 없다', () => {
  for (const pathname of [
    '/resident',
    '/resident/conversations',
    '/resident/complaints',
    '/resident/mypage',
    '/manager',
    '/manager/rooms',
    '/manager/complaints',
    '/manager/documents',
  ]) {
    assert.equal(backTarget(pathname), null, pathname);
  }
});
