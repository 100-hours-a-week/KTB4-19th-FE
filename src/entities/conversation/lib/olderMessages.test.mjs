import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAutoLoadOlder,
  latestMessageId,
  orderedMessages,
  scrollTopAfterPrepend,
} from './olderMessages.mjs';

const latestPage = { messages: [{ messageId: 21 }, { messageId: 22 }] };
const olderPage = { messages: [{ messageId: 1 }, { messageId: 2 }] };
const idle = {
  hasNextPage: true,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
};

test('이전 페이지 메시지는 최신 페이지 메시지보다 위에 놓인다', () => {
  assert.deepEqual(
    orderedMessages([latestPage, olderPage]).map(
      (message) => message.messageId,
    ),
    [1, 2, 21, 22],
  );
});

test('이전 메시지를 불러와도 가장 최근 메시지는 바뀌지 않는다', () => {
  assert.equal(latestMessageId([latestPage]), 22);
  assert.equal(latestMessageId([latestPage, olderPage]), 22);
});

test('메시지가 없으면 가장 최근 메시지가 없다', () => {
  assert.equal(latestMessageId(undefined), null);
  assert.equal(latestMessageId([{ messages: [] }]), null);
});

test('이전 메시지가 남아 있고 불러오는 중이 아니면 자동으로 불러온다', () => {
  assert.equal(canAutoLoadOlder(idle), true);
});

test('이전 메시지가 없으면 불러오지 않는다', () => {
  assert.equal(canAutoLoadOlder({ ...idle, hasNextPage: false }), false);
});

test('이미 불러오는 중이면 다시 불러오지 않는다', () => {
  assert.equal(canAutoLoadOlder({ ...idle, isFetchingNextPage: true }), false);
});

test('불러오기에 실패하면 자동으로 다시 시도하지 않는다', () => {
  assert.equal(
    canAutoLoadOlder({ ...idle, isFetchNextPageError: true }),
    false,
  );
});

test('위에 메시지가 붙은 만큼 스크롤을 내려 보던 위치를 유지한다', () => {
  assert.equal(
    scrollTopAfterPrepend({
      scrollTop: 0,
      previousHeight: 1000,
      currentHeight: 1600,
    }),
    600,
  );
});

test('높이가 줄어들면 스크롤 위치를 그대로 둔다', () => {
  assert.equal(
    scrollTopAfterPrepend({
      scrollTop: 120,
      previousHeight: 1000,
      currentHeight: 900,
    }),
    120,
  );
});
