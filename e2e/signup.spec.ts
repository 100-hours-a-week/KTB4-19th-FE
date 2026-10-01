import { expect, test, type Page } from '@playwright/test';
import {
  createAccountWithoutRole,
  randomEmail,
  randomPassword,
} from './support/api';
import { agreeToTerms } from './support/ui';

type SignupForm = {
  email: string;
  password: string;
  passwordConfirm?: string;
  checkEmail?: boolean;
  agreeTerms?: boolean;
};

async function fillSignupForm(page: Page, form: SignupForm) {
  await page.goto('/auth/signup');
  await page.getByLabel('이메일').fill(form.email);
  if (form.checkEmail ?? true) {
    await page.getByRole('button', { name: '중복 확인' }).click();
    await expect(page.getByRole('status')).toBeVisible();
  }
  await page.getByLabel('비밀번호', { exact: true }).fill(form.password);
  await page
    .getByLabel('비밀번호 확인')
    .fill(form.passwordConfirm ?? form.password);
  if (form.agreeTerms ?? true) {
    await agreeToTerms(page, 0);
    await agreeToTerms(page, 1);
    await expect(page.getByRole('checkbox').nth(0)).toBeChecked();
    await expect(page.getByRole('checkbox').nth(1)).toBeChecked();
  }
}

test('가입하면 로그인 화면에 가입 완료 안내와 가입한 이메일이 보인다', async ({
  page,
}) => {
  const email = randomEmail();
  await fillSignupForm(page, { email, password: randomPassword() });
  await expect(page.getByText('사용 가능한 이메일입니다.')).toBeVisible();

  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(page).toHaveURL('/auth/login');
  await expect(
    page.getByText('회원가입이 완료됐어요', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('이메일')).toHaveValue(email);
});

test('이메일 중복 확인 전에는 가입할 수 없다', async ({ page }) => {
  await fillSignupForm(page, {
    email: randomEmail(),
    password: randomPassword(),
    checkEmail: false,
  });

  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(
    page.getByText('이메일 중복 확인을 먼저 완료해 주세요.'),
  ).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');
});

test('이미 가입된 이메일은 중복 확인에서 사용 중이라고 안내한다', async ({
  page,
}) => {
  const existing = await createAccountWithoutRole();
  await page.goto('/auth/signup');
  await page.getByLabel('이메일').fill(existing.email);

  await page.getByRole('button', { name: '중복 확인' }).click();

  await expect(page.getByText('이미 사용 중인 이메일입니다.')).toBeVisible();
});

test('비밀번호와 비밀번호 확인이 다르면 안내가 보인다', async ({ page }) => {
  const password = randomPassword();
  await fillSignupForm(page, {
    email: randomEmail(),
    password,
    passwordConfirm: `${password}x`,
  });

  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(
    page.getByText('비밀번호와 비밀번호 확인이 일치하지 않습니다.'),
  ).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');
});

test('비밀번호 형식이 틀리면 안내가 보인다', async ({ page }) => {
  await fillSignupForm(page, { email: randomEmail(), password: 'onlyletters' });

  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(
    page.getByText('비밀번호 형식이 올바르지 않습니다.'),
  ).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');
});

test('필수 약관에 동의하지 않으면 가입할 수 없다', async ({ page }) => {
  await fillSignupForm(page, {
    email: randomEmail(),
    password: randomPassword(),
    agreeTerms: false,
  });

  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(page.getByText('필수 약관에 모두 동의해 주세요.')).toBeVisible();
  await expect(page).toHaveURL('/auth/signup');
});
