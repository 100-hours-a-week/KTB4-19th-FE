import { expect, test, type Page } from '@playwright/test';
import { loginWithForm, segment } from './support/ui';

const resident = {
  email: process.env.E2E_RESIDENT_EMAIL ?? '',
  password: process.env.E2E_RESIDENT_PASSWORD ?? '',
};
const manager = {
  email: process.env.E2E_MANAGER_EMAIL ?? '',
  password: process.env.E2E_MANAGER_PASSWORD ?? '',
};

async function expectLoaded(page: Page) {
  await expect(page.locator('.skeleton-row')).toHaveCount(0);
  await expect(page.getByText('내용을 불러오지 못했어요')).toHaveCount(0);
  await expect(page.getByText('대화 목록을 불러오지 못했어요')).toHaveCount(0);
}

async function searchAndFilter(page: Page) {
  const search = page.getByRole('textbox', { name: '민원 제목 검색' });
  await search.fill('누수');
  await search.press('Enter');
  await expectLoaded(page);
  await search.fill('');
  await search.press('Enter');

  for (const status of ['처리전', '처리중', '완료', '전체']) {
    await segment(page, status).click();
    await expectLoaded(page);
  }
}

test.describe('운영 입주민 조회', () => {
  test.skip(
    !resident.email || !resident.password,
    'e2e/.env에 입주민 테스트 계정이 없어 건너뜀',
  );

  test.beforeEach(async ({ page }) => {
    await loginWithForm(page, resident);
    await expect(page).toHaveURL('/resident');
  });

  test('로그인하면 입주민 홈과 최근 대화가 보인다 @readonly', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: '무엇을 도와드릴까요?' }),
    ).toBeVisible();
    await expectLoaded(page);
  });

  test('대화 목록에서 대화를 열 수 있다 @readonly', async ({ page }) => {
    await page.goto('/resident/conversations');
    await expectLoaded(page);

    await page.locator('.list-row').first().click();

    await expect(page).toHaveURL(/\/resident\/conversations\/\d+$/);
    await expect(page.locator('.chat-body .message').first()).toBeVisible();
    await expect(page.getByText('대화를 불러오지 못했어요')).toHaveCount(0);
  });

  test('대화 목록 검색이 동작한다 @readonly', async ({ page }) => {
    await page.goto('/resident/conversations');
    const search = page.getByRole('textbox', { name: '대화 제목 검색' });

    await search.fill('누수');
    await search.press('Enter');

    await expectLoaded(page);
  });

  test('민원 목록에서 민원 상세를 열 수 있다 @readonly', async ({ page }) => {
    await page.goto('/resident/complaints');
    await expectLoaded(page);

    await page.locator('.list-row').first().click();

    await expect(page).toHaveURL(/\/resident\/complaints\/\d+$/);
    await expect(
      page.getByRole('heading', { name: '발생 정보' }),
    ).toBeVisible();
  });

  test('민원 목록 검색과 상태 필터가 동작한다 @readonly', async ({ page }) => {
    await page.goto('/resident/complaints');
    await expectLoaded(page);

    await searchAndFilter(page);
  });
});

test.describe('운영 관리자 조회', () => {
  test.skip(
    !manager.email || !manager.password,
    'e2e/.env에 관리자 테스트 계정이 없어 건너뜀',
  );

  test.beforeEach(async ({ page }) => {
    await loginWithForm(page, manager);
    await expect(page).toHaveURL('/manager');
  });

  test('민원 목록에서 민원 상세와 대화 원본을 열 수 있다 @readonly', async ({
    page,
  }) => {
    await page.goto('/manager/complaints');
    await expectLoaded(page);

    await page.locator('.list-row').first().click();
    await expect(
      page.getByRole('heading', { name: '발생 정보' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'AI 대화 원본 보기' }).click();

    await expect(
      page.getByText('관리자 화면에서는 원본 대화에 메시지를 보낼 수 없어요.'),
    ).toBeVisible();
  });

  test('민원 목록 검색과 상태 필터가 동작한다 @readonly', async ({ page }) => {
    await page.goto('/manager/complaints');
    await expectLoaded(page);

    await searchAndFilter(page);
  });
});
