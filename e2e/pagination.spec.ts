import { expect, test } from '@playwright/test';
import {
  createResidence,
  loginAs,
  sendConversationMessage,
  startConversation,
  submitComplaint,
  type Account,
} from './support/api';

const firstQuestion = '분리수거 1번 질문 있어요?';

async function startLongConversation(resident: Account) {
  const conversation = await startConversation(resident, firstQuestion);
  for (let number = 2; number <= 11; number += 1) {
    await sendConversationMessage(
      resident,
      conversation.conversationId,
      `분리수거 ${number}번 질문 있어요?`,
    );
  }
  return conversation;
}

test('대화 목록은 끝까지 내리면 다음 대화를 더 불러온다', async ({ page }) => {
  const { resident } = await createResidence();
  for (let number = 1; number <= 21; number += 1) {
    await startConversation(resident, `분리수거 ${number}번 질문 있어요?`);
  }
  await loginAs(page, resident);
  await page.goto('/resident/conversations');
  const rows = page.locator('.list-row');
  await expect(rows).toHaveCount(20);

  await rows.last().scrollIntoViewIfNeeded();

  await expect(rows).toHaveCount(21);
});

test('채팅방에서 이전 메시지 보기를 누르면 앞선 메시지가 보인다', async ({
  page,
}) => {
  const { resident } = await createResidence();
  const conversation = await startLongConversation(resident);
  await loginAs(page, resident);
  await page.goto(`/resident/conversations/${conversation.conversationId}`);
  const firstMessage = page
    .locator('.chat-body')
    .getByText(firstQuestion, { exact: true });
  await expect(firstMessage).toHaveCount(0);

  await page.getByRole('button', { name: '이전 메시지 보기' }).click();

  await expect(firstMessage).toBeVisible();
});

test('관리자 대화 원본에서 이전 대화 더 보기를 누르면 앞선 메시지가 보인다', async ({
  page,
}) => {
  const { manager, resident } = await createResidence();
  const conversation = await startLongConversation(resident);
  await sendConversationMessage(
    resident,
    conversation.conversationId,
    '천장에서 물이 새요',
  );
  await sendConversationMessage(
    resident,
    conversation.conversationId,
    '욕실 천장',
  );
  await submitComplaint(resident, conversation.conversationId);
  await loginAs(page, manager);
  await page.goto(`/manager/conversations/${conversation.conversationId}`);
  const firstMessage = page
    .locator('.readonly-chat')
    .getByText(firstQuestion, { exact: true });
  await expect(firstMessage).toHaveCount(0);

  await page.getByRole('button', { name: '이전 대화 더 보기' }).click();

  await expect(firstMessage).toBeVisible();
  await expect(page.locator('.readonly-chat .message').first()).toContainText(
    firstQuestion,
  );
});
