import { expect, test, type Page } from '@playwright/test';
import {
  createResidence,
  loginAs,
  startConversation,
  type Residence,
} from './support/api';
import { sendMessage } from './support/ui';

let residence: Residence;

async function startNewConversation(page: Page, message: string) {
  await page.goto('/resident/conversations/new');
  await sendMessage(page, message);
  await expect(page).toHaveURL(/\/resident\/conversations\/\d+$/);
}

test.beforeEach(async ({ page }) => {
  residence = await createResidence();
  await loginAs(page, residence.resident);
});

test('불편을 말하면 내 메시지와 위치를 묻는 답변이 보인다', async ({
  page,
}) => {
  await startNewConversation(page, '천장에서 물이 새요');

  await expect(page.getByText('천장에서 물이 새요').first()).toBeVisible();
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();
});

test('생활 문의를 하면 운영규칙 기준 답변이 보인다', async ({ page }) => {
  await startNewConversation(page, '분리수거 요일이 언제예요?');

  await expect(
    page.getByText('건물 운영규칙을 기준으로 안내해 드려요', { exact: false }),
  ).toBeVisible();
});

test('너무 짧은 메시지를 보내면 다시 묻는 답변이 보인다', async ({ page }) => {
  await startNewConversation(page, '아');

  await expect(
    page.getByText('말씀하신 내용을 이해하지 못했어요', { exact: false }),
  ).toBeVisible();
});

test('입력이 비어 있으면 전송할 수 없다', async ({ page }) => {
  await page.goto('/resident/conversations/new');

  await expect(page.getByRole('button', { name: '전송' })).toBeDisabled();
  await page.getByRole('textbox', { name: '메시지' }).fill('   ');
  await expect(page.getByRole('button', { name: '전송' })).toBeDisabled();
});

test('이어서 보낸 메시지에도 답변이 붙는다', async ({ page }) => {
  await startNewConversation(page, '천장에서 물이 새요');
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();

  await sendMessage(page, '욕실 천장');

  await expect(page.getByText('욕실 천장').first()).toBeVisible();
  await expect(
    page.getByText('접수 내용을 정리했어요', { exact: false }),
  ).toBeVisible();
});

test('시작한 대화가 대화 목록에 보인다', async ({ page }) => {
  await startNewConversation(page, '천장에서 물이 새요');
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();

  await page.goto('/resident/conversations');

  await expect(page.locator('.list-row')).toHaveCount(1);
  await expect(
    page.locator('.list-row').getByText('진행중', { exact: true }),
  ).toBeVisible();
});

test('대화 제목으로 검색하면 맞는 대화만 보인다', async ({ page }) => {
  await startConversation(residence.resident, '천장에서 물이 새요');
  await startConversation(residence.resident, '분리수거 요일이 언제예요?');
  await page.goto('/resident/conversations');
  await expect(page.locator('.list-row')).toHaveCount(2);

  const search = page.getByRole('textbox', { name: '대화 제목 검색' });
  await search.fill('분리수거');
  await search.press('Enter');

  await expect(page.locator('.list-row')).toHaveCount(1);
  await expect(
    page.locator('.list-row').getByText('분리수거 요일이 언제예요?'),
  ).toBeVisible();
});

test('AI 응답이 실패하면 안내가 보이고 입력한 내용은 남아 있다', async ({
  page,
}) => {
  await startNewConversation(page, '분리수거 요일이 언제예요?');
  await page.route(
    '**/api/v1/residents/me/conversations/*/messages',
    (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({
              message: 'AI 응답 실패',
              data: null,
              error: { code: 'AI_UNAVAILABLE' },
            }),
          })
        : route.continue(),
  );

  await sendMessage(page, '음식물 쓰레기는요?');

  await expect(
    page.getByText('메시지를 보내지 못했어요', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: '메시지' })).toHaveValue(
    '음식물 쓰레기는요?',
  );
});

test('요청이 너무 많으면 전송 버튼이 잠시 잠긴다', async ({ page }) => {
  await startNewConversation(page, '분리수거 요일이 언제예요?');
  await page.route(
    '**/api/v1/residents/me/conversations/*/messages',
    (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              message: '요청이 너무 많습니다.',
              data: null,
              error: {
                code: 'TOO_MANY_REQUESTS',
                details: { retryAfterSeconds: 30 },
              },
            }),
          })
        : route.continue(),
  );

  await sendMessage(page, '음식물 쓰레기는요?');

  await expect(
    page.getByText('요청이 너무 많아요. 잠시 후 다시 보내 주세요.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /초 후 전송/ })).toBeDisabled();
});

test('새로고침해도 주고받은 메시지가 그대로 보인다', async ({ page }) => {
  await startNewConversation(page, '천장에서 물이 새요');
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();

  await page.reload();

  await expect(
    page.locator('.chat-body').getByText('천장에서 물이 새요', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('문제가 생긴 위치가 어디인가요?', { exact: false }),
  ).toBeVisible();
});

test('입주민 홈의 새 대화 시작 버튼으로 새 대화 화면에 들어간다', async ({
  page,
}) => {
  await page.goto('/resident');

  await page
    .locator('.resident-hero')
    .getByRole('link', { name: '새 대화 시작' })
    .click();

  await expect(page).toHaveURL('/resident/conversations/new');
});

test('입주민 홈의 추천 문구를 누르면 새 대화 화면에 들어간다', async ({
  page,
}) => {
  await page.goto('/resident');

  await page.getByRole('link', { name: /천장에서 물이 새요/ }).click();

  await expect(page).toHaveURL('/resident/conversations/new');
});

test('입주민 홈 최근 대화는 3개까지만 보인다', async ({ page }) => {
  for (const content of [
    '천장에서 물이 새요',
    '분리수거 요일이 언제예요?',
    '주차 등록은 어떻게 하나요?',
    '창문이 안 닫혀요',
  ]) {
    await startConversation(residence.resident, content);
  }

  await page.goto('/resident');

  await expect(page.locator('.list-row')).toHaveCount(3);
});

test('Enter를 누르면 메시지가 전송된다', async ({ page }) => {
  await page.goto('/resident/conversations/new');

  await page
    .getByRole('textbox', { name: '메시지' })
    .fill('분리수거 요일이 언제예요?');
  await page.getByRole('textbox', { name: '메시지' }).press('Enter');

  await expect(page).toHaveURL(/\/resident\/conversations\/\d+$/);
});

test('Shift+Enter를 누르면 전송하지 않고 줄을 바꾼다', async ({ page }) => {
  await page.goto('/resident/conversations/new');
  const textbox = page.getByRole('textbox', { name: '메시지' });

  await textbox.fill('첫째 줄');
  await textbox.press('Shift+Enter');
  await textbox.pressSequentially('둘째 줄');

  await expect(textbox).toHaveValue('첫째 줄\n둘째 줄');
  await expect(page).toHaveURL('/resident/conversations/new');
});

test('규칙으로 답할 수 없는 질문은 관리인 전달 안내와 접수 카드가 보인다', async ({
  page,
}) => {
  await startNewConversation(page, '관리자에게 직접 문의할 수 있나요?');

  await expect(
    page.getByText('질문을 관리인에게 전달해 두었습니다', { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .locator('.summary-card')
      .getByText('관리자에게 직접 문의할 수 있나요?'),
  ).toBeVisible();
});
