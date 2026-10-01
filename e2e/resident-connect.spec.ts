import { expect, test } from '@playwright/test';
import { createAccountWithoutRole, createInvitation } from './support/api';
import { loginWithForm, selectRole } from './support/ui';

test.beforeEach(async ({ page }) => {
  const account = await createAccountWithoutRole();
  await loginWithForm(page, account);
  await selectRole(page, '입주민');
  await expect(page).toHaveURL('/resident/connect');
});

test('관리자가 발급한 초대코드로 입주 연결하면 입주민 홈으로 이동한다', async ({
  page,
}) => {
  const invitation = await createInvitation();

  await page.getByLabel('초대코드').fill(invitation.code);
  await page.getByRole('button', { name: '코드 확인' }).click();
  await expect(
    page.getByRole('heading', { name: '이 세대가 맞나요?' }),
  ).toBeVisible();
  await expect(
    page.getByText(invitation.buildingName, { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: '맞아요, 연결할게요' }).click();
  await expect(page.getByRole('heading', { name: /연결됐어요/ })).toBeVisible();
  await page.getByRole('button', { name: '홈으로 가기' }).click();

  await expect(page).toHaveURL('/resident');
  await expect(
    page.getByRole('heading', { name: '무엇을 도와드릴까요?' }),
  ).toBeVisible();
});

test('세대 확인에서 다시 입력을 누르면 초대코드 입력으로 돌아간다', async ({
  page,
}) => {
  const invitation = await createInvitation();
  await page.getByLabel('초대코드').fill(invitation.code);
  await page.getByRole('button', { name: '코드 확인' }).click();
  await expect(
    page.getByRole('heading', { name: '이 세대가 맞나요?' }),
  ).toBeVisible();

  await page.getByRole('button', { name: '다시 입력' }).click();

  await expect(
    page.getByRole('heading', { name: '초대코드를 입력해 주세요' }),
  ).toBeVisible();
});

test('발급되지 않은 초대코드를 입력하면 찾을 수 없다는 안내가 보인다', async ({
  page,
}) => {
  await page.getByLabel('초대코드').fill('ZZZZZZ');
  await page.getByRole('button', { name: '코드 확인' }).click();

  await expect(
    page.getByText('유효한 초대코드를 찾을 수 없어요.'),
  ).toBeVisible();
});

test('초대코드가 6자리가 아니면 다시 입력하라는 안내가 보인다', async ({
  page,
}) => {
  await page.getByLabel('초대코드').fill('ABC');
  await page.getByRole('button', { name: '코드 확인' }).click();

  await expect(page.getByText('초대코드 6자리를 입력해 주세요.')).toBeVisible();
});
