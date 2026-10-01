import { expect, test } from '@playwright/test';
import { createResidence } from './support/api';
import { loginWithForm } from './support/ui';

test('입주민이 로그인 화면에서 로그인하면 입주민 홈으로 이동한다', async ({
  page,
}) => {
  const { resident } = await createResidence();

  await loginWithForm(page, resident);

  await expect(page).toHaveURL('/resident');
  await expect(
    page.getByRole('heading', { name: '무엇을 도와드릴까요?' }),
  ).toBeVisible();
});

test('관리자가 로그인 화면에서 로그인하면 관리자 홈으로 이동한다', async ({
  page,
}) => {
  const { manager } = await createResidence();

  await loginWithForm(page, manager);

  await expect(page).toHaveURL('/manager');
});

test('비밀번호가 틀리면 일치하지 않는다는 안내가 보인다', async ({ page }) => {
  const { resident } = await createResidence();

  await loginWithForm(page, {
    email: resident.email,
    password: `${resident.password}x`,
  });

  await expect(
    page.getByText('이메일 또는 비밀번호가 일치하지 않습니다.'),
  ).toBeVisible();
  await expect(page).toHaveURL('/auth/login');
});

test('새로고침해도 로그인이 유지된다', async ({ page }) => {
  const { resident } = await createResidence();
  await loginWithForm(page, resident);
  await expect(page).toHaveURL('/resident');

  await page.reload();

  await expect(page).toHaveURL('/resident');
  await expect(
    page.getByRole('heading', { name: '무엇을 도와드릴까요?' }),
  ).toBeVisible();
});
