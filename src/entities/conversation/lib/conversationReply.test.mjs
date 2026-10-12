import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appendMessages,
  isAwaitingReply,
  parseConversationReply,
  parseConversationReplyFailure,
} from './conversationReply.mjs';

const message = (messageId, senderType = 'RESIDENT') => ({
  messageId,
  senderType,
  messageType: 'TEXT',
  content: `메시지 ${messageId}`,
  attachments: [],
  createdAt: '2026-10-12T14:00:00',
});

const messagesData = (latest, older = []) => ({
  pageParams: [undefined],
  pages: [
    { closesAt: '2026-10-12T14:05:00+09:00', messages: latest },
    ...older.map((messages) => ({ closesAt: null, messages })),
  ],
});

test('AI 답변 이벤트는 대화 ID와 답변 메시지가 있어야 읽는다', () => {
  const reply = {
    conversationId: 3,
    assistantMessage: message(11, 'ASSISTANT'),
    closesAt: '2026-10-12T14:10:00+09:00',
  };

  assert.deepEqual(parseConversationReply(JSON.stringify(reply)), reply);
  assert.equal(parseConversationReply('{"conversationId":3}'), null);
  assert.equal(
    parseConversationReply(JSON.stringify({ ...reply, conversationId: '3' })),
    null,
  );
  assert.equal(parseConversationReply('broken'), null);
});

test('AI 답변 실패 이벤트는 대화 ID와 오류 코드가 있어야 읽는다', () => {
  const failure = {
    conversationId: 3,
    code: 'AI_UNAVAILABLE',
    message: '실패',
  };

  assert.deepEqual(
    parseConversationReplyFailure(JSON.stringify(failure)),
    failure,
  );
  assert.equal(parseConversationReplyFailure('{"conversationId":3}'), null);
  assert.equal(
    parseConversationReplyFailure('{"conversationId":0,"code":"X"}'),
    null,
  );
});

test('마지막 메시지가 입주민 메시지면 AI 답변을 기다리는 중이다', () => {
  assert.equal(isAwaitingReply([message(1, 'ASSISTANT'), message(2)]), true);
  assert.equal(isAwaitingReply([message(1), message(2, 'ASSISTANT')]), false);
  assert.equal(isAwaitingReply([]), false);
});

test('메시지는 최신 페이지 끝에 붙이고 종료 시각을 바꾼다', () => {
  const data = messagesData([message(2)], [[message(1, 'ASSISTANT')]]);

  const appended = appendMessages(
    data,
    [message(3, 'ASSISTANT')],
    '2026-10-12T14:10:00+09:00',
  );

  assert.deepEqual(
    appended.pages[0].messages.map((saved) => saved.messageId),
    [2, 3],
  );
  assert.equal(appended.pages[0].closesAt, '2026-10-12T14:10:00+09:00');
  assert.equal(appended.pages[1], data.pages[1]);
});

test('종료 시각을 넘기지 않으면 기존 종료 시각을 유지한다', () => {
  const data = messagesData([message(1, 'ASSISTANT')]);

  const appended = appendMessages(data, [message(2)]);

  assert.equal(appended.pages[0].closesAt, '2026-10-12T14:05:00+09:00');
});

test('이미 화면에 있는 메시지는 다시 붙이지 않는다', () => {
  const data = messagesData([message(2)], [[message(1, 'ASSISTANT')]]);

  const appended = appendMessages(data, [message(1, 'ASSISTANT'), message(2)]);

  assert.deepEqual(
    appended.pages.flatMap((page) =>
      page.messages.map((saved) => saved.messageId),
    ),
    [2, 1],
  );
});

test('불러온 메시지가 없으면 그대로 둔다', () => {
  assert.equal(appendMessages(undefined, [message(1)]), undefined);
});
