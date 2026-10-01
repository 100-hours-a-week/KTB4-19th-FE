import type { Page } from '@playwright/test';

export function segment(page: Page, label: string) {
  return page.locator('label.seed-segmented-control__item', {
    hasText: new RegExp(`^${label}$`),
  });
}

const maxLoginAttempts = 4;
const rateLimitWindowMs = 35_000;

export async function loginWithForm(
  page: Page,
  account: { email: string; password: string },
) {
  await page.goto('/auth/login');
  await page.getByLabel('이메일').fill(account.email);
  await page.getByLabel('비밀번호').fill(account.password);
  const loginButton = page.getByRole('button', { name: '로그인', exact: true });

  for (let attempt = 1; attempt <= maxLoginAttempts; attempt += 1) {
    const response = page.waitForResponse((received) =>
      received.url().endsWith('/api/v1/auth/login'),
    );
    await loginButton.click();
    if ((await response).status() !== 429) return;
    await loginButton.waitFor({ state: 'visible', timeout: rateLimitWindowMs });
  }
}

export async function sendMessage(page: Page, message: string) {
  await page.getByRole('textbox', { name: '메시지' }).fill(message);
  await page.getByRole('button', { name: '전송' }).click();
}
