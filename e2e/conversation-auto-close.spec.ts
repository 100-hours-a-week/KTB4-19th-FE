import { expect, test } from '@playwright/test';
import { createResidence, loginAs, startConversation } from './support/api';

test('마지막 메시지 후 5분이 지나면 입력창 대신 종료 안내가 보인다', async ({
  page,
}) => {
  const residence = await createResidence();
  const conversation = await startConversation(
    residence.resident,
    '분리수거 요일이 언제예요?',
  );
  await page.clock.install();
  await loginAs(page, residence.resident);

  await page.goto(`/resident/conversations/${conversation.conversationId}`);
  await expect(page.getByRole('textbox', { name: '메시지' })).toBeVisible();

  await page.clock.fastForward('05:01');

  await expect(
    page.getByText('마지막 대화 후 5분이 지나 종료된 대화예요', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: '메시지' })).toHaveCount(0);
  await expect(
    page.locator('.chat-header').getByText('대화 종료'),
  ).toBeVisible();
});

test('5분이 지나기 전에는 대화를 이어갈 수 있다', async ({ page }) => {
  const residence = await createResidence();
  const conversation = await startConversation(
    residence.resident,
    '분리수거 요일이 언제예요?',
  );
  await page.clock.install();
  await loginAs(page, residence.resident);

  await page.goto(`/resident/conversations/${conversation.conversationId}`);
  await page.clock.fastForward('04:30');

  await expect(page.getByRole('textbox', { name: '메시지' })).toBeVisible();
  await expect(page.locator('.chat-header').getByText('진행중')).toBeVisible();
});

test('5분이 지난 대화는 목록에서도 대화 종료로 보인다', async ({ page }) => {
  const residence = await createResidence();
  await startConversation(residence.resident, '분리수거 요일이 언제예요?');
  await page.clock.install();
  await loginAs(page, residence.resident);

  await page.goto('/resident/conversations');
  await expect(page.locator('.list-row').getByText('진행중')).toBeVisible();

  await page.clock.fastForward('05:01');

  await expect(page.locator('.list-row').getByText('대화 종료')).toBeVisible();
});
