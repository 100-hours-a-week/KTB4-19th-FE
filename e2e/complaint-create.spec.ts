import { expect, test, type Page } from '@playwright/test';
import {
  createResidence,
  loginAs,
  sendConversationMessage,
  startConversation,
  type Residence,
} from './support/api';
import { sendMessage } from './support/ui';

let residence: Residence;

async function answerUntilSummaryCard(page: Page) {
  await page.goto('/resident/conversations/new');
  await sendMessage(page, '천장에서 물이 새요');
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();

  await sendMessage(page, '욕실 천장');
  await expect(page.locator('.summary-card')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  residence = await createResidence();
  await loginAs(page, residence.resident);
});

test('증상과 위치를 답하면 두 값이 채워진 접수 카드가 보인다', async ({
  page,
}) => {
  await answerUntilSummaryCard(page);

  const card = page.locator('.summary-card');
  await expect(card.getByText('민원 접수 내용')).toBeVisible();
  await expect(card.getByText('욕실 천장')).toBeVisible();
  await expect(card.getByText('천장에서 물이 새요')).toBeVisible();
});

test('접수 카드가 뜨면 입력창 대신 확인 안내가 보인다', async ({ page }) => {
  await answerUntilSummaryCard(page);

  await expect(page.getByText('접수 내용을 확인해 주세요')).toBeVisible();
  await expect(page.getByRole('textbox', { name: '메시지' })).toHaveCount(0);
});

test('이대로 접수하면 접수 완료 안내가 보인다', async ({ page }) => {
  await answerUntilSummaryCard(page);

  await page.getByRole('button', { name: '이대로 접수' }).click();

  await expect(page.getByText('민원이 접수됐어요')).toBeVisible();
  await expect(page.getByRole('button', { name: '이대로 접수' })).toHaveCount(
    0,
  );
});

test('내용 수정에서 위치를 바꿔 접수하면 바뀐 위치로 저장된다', async ({
  page,
}) => {
  await answerUntilSummaryCard(page);

  await page.getByRole('button', { name: '내용 수정' }).click();
  await page.getByRole('textbox', { name: '위치' }).fill('안방 천장');
  await page.getByRole('button', { name: '수정 완료' }).click();
  await expect(
    page.locator('.summary-card').getByText('안방 천장'),
  ).toBeVisible();
  await page.getByRole('button', { name: '이대로 접수' }).click();
  await expect(page.getByText('민원이 접수됐어요')).toBeVisible();

  await page.goto('/resident/complaints');
  await page.locator('.list-row').first().click();

  await expect(
    page.locator('.complaint-detail').getByText('안방 천장', { exact: true }),
  ).toBeVisible();
});

test('접수한 뒤 새로고침해도 입력창은 닫혀 있다', async ({ page }) => {
  await answerUntilSummaryCard(page);
  await page.getByRole('button', { name: '이대로 접수' }).click();
  await expect(page.getByText('민원이 접수됐어요')).toBeVisible();

  await page.reload();

  await expect(page.getByText('민원이 접수된 대화예요')).toBeVisible();
  await expect(page.getByRole('textbox', { name: '메시지' })).toHaveCount(0);
});

test('화면에서 접수한 민원이 대화 목록과 내 민원 목록에 보인다', async ({
  page,
}) => {
  await answerUntilSummaryCard(page);
  await page.getByRole('button', { name: '이대로 접수' }).click();
  await expect(page.getByText('민원이 접수됐어요')).toBeVisible();

  await page.goto('/resident/conversations');
  await expect(
    page.locator('.list-row').getByText('민원 생성 완료'),
  ).toBeVisible();

  await page.goto('/resident/complaints');
  await expect(page.locator('.list-row')).toHaveCount(1);
  await expect(page.locator('.list-row').getByText('처리전')).toBeVisible();
});

test('다른 탭에서 먼저 접수한 대화는 이미 접수됐다는 안내가 보인다', async ({
  page,
  context,
}) => {
  const conversation = await startConversation(
    residence.resident,
    '천장에서 물이 새요',
  );
  await sendConversationMessage(
    residence.resident,
    conversation.conversationId,
    '욕실 천장',
  );
  const otherTab = await context.newPage();
  await page.goto(`/resident/conversations/${conversation.conversationId}`);
  await otherTab.goto(`/resident/conversations/${conversation.conversationId}`);

  await otherTab.getByRole('button', { name: '이대로 접수' }).click();
  await expect(otherTab.getByText('민원이 접수됐어요')).toBeVisible();
  await page.getByRole('button', { name: '이대로 접수' }).click();

  await expect(page.getByText('이미 민원이 접수된 대화예요')).toBeVisible();
});
