import { expect, test } from '@playwright/test';
import { createAccountWithoutRole } from './support/api';
import { loginWithForm, selectRole } from './support/ui';

test.beforeEach(async ({ page }) => {
  const account = await createAccountWithoutRole();
  await loginWithForm(page, account);
});

test('가입 후 처음 로그인하면 역할 선택 화면으로 이동한다', async ({
  page,
}) => {
  await expect(page).toHaveURL('/auth/role');
  await expect(
    page.getByRole('heading', { name: '어떻게 이용하시나요?' }),
  ).toBeVisible();
});

test('입주민을 선택하면 입주 연결 화면으로 이동한다', async ({ page }) => {
  await selectRole(page, '입주민');

  await expect(page).toHaveURL('/resident/connect');
  await expect(
    page.getByRole('heading', { name: '초대코드를 입력해 주세요' }),
  ).toBeVisible();
});

test('관리자를 선택하면 건물 등록 화면으로 이동한다', async ({ page }) => {
  await selectRole(page, '관리자');

  await expect(page).toHaveURL('/manager/building/new');
});

test('역할을 정한 뒤에는 역할 선택 화면에 다시 들어갈 수 없다', async ({
  page,
}) => {
  await selectRole(page, '입주민');
  await expect(page).toHaveURL('/resident/connect');

  await page.goto('/auth/role');

  await expect(page).toHaveURL('/resident/connect');
  await expect(
    page.getByRole('heading', { name: '어떻게 이용하시나요?' }),
  ).toHaveCount(0);
});
