import { expect, test } from '@playwright/test';
import {
  createComplaint,
  createResidence,
  loginAs,
  type CreatedComplaint,
  type Residence,
} from './support/api';
import { segment } from './support/ui';

let residence: Residence;
let complaint: CreatedComplaint;

test.beforeEach(async () => {
  residence = await createResidence();
  complaint = await createComplaint(residence.resident);
});

test('입주민 민원 목록과 상세에 접수한 민원이 보인다', async ({ page }) => {
  await loginAs(page, residence.resident);
  await page.goto('/resident/complaints');

  const row = page.locator('.list-row', { hasText: complaint.title });
  await expect(row).toBeVisible();
  await expect(row.getByText('처리전')).toBeVisible();

  await row.click();

  await expect(
    page.getByRole('heading', { level: 1, name: complaint.title }),
  ).toBeVisible();
  await expect(
    page.locator('.complaint-detail').getByText('욕실 천장', { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator('.complaint-detail')
      .getByText('천장에서 물이 새요', { exact: true }),
  ).toBeVisible();
});

test('입주민 민원 상세에서 접수한 대화로 이동한다', async ({ page }) => {
  await loginAs(page, residence.resident);
  await page.goto(`/resident/complaints/${complaint.complaintId}`);

  await page.getByRole('link', { name: '접수 대화 보기' }).click();

  await expect(page).toHaveURL(
    `/resident/conversations/${complaint.conversationId}`,
  );
  await expect(page.getByText('민원이 접수된 대화예요')).toBeVisible();
  await expect(page.getByRole('textbox', { name: '메시지' })).toHaveCount(0);
});

test('관리자 민원 목록과 상세에 입주민 민원이 보인다', async ({ page }) => {
  await loginAs(page, residence.manager);
  await page.goto('/manager/complaints');

  const row = page.locator('.list-row', { hasText: complaint.title });
  await expect(row).toBeVisible();
  await expect(
    row.getByText(residence.buildingName, { exact: false }),
  ).toBeVisible();

  await row.click();

  await expect(
    page.getByRole('heading', { level: 1, name: complaint.title }),
  ).toBeVisible();
  await expect(
    page.locator('.complaint-detail').getByText('욕실 천장', { exact: true }),
  ).toBeVisible();
});

test('관리자는 민원의 대화 원본을 읽기 전용으로 본다', async ({ page }) => {
  await loginAs(page, residence.manager);
  await page.goto(`/manager/complaints/${complaint.complaintId}`);

  await page.getByRole('link', { name: 'AI 대화 원본 보기' }).click();

  await expect(page).toHaveURL(
    `/manager/conversations/${complaint.conversationId}`,
  );
  await expect(
    page
      .locator('.readonly-chat')
      .getByText('천장에서 물이 새요', { exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('.readonly-chat').getByText('욕실 천장', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('관리자 화면에서는 원본 대화에 메시지를 보낼 수 없어요.'),
  ).toBeVisible();
});

test('관리자가 처리 상태를 바꾸면 입주민 화면에도 같은 상태가 보인다', async ({
  page,
}) => {
  await loginAs(page, residence.manager);
  await page.goto(`/manager/complaints/${complaint.complaintId}`);
  const heading = page.locator('.complaint-heading');

  await segment(page, '처리중').click();
  await expect(heading.getByText('처리중')).toBeVisible();
  await segment(page, '완료').click();
  await expect(heading.getByText('처리완료')).toBeVisible();

  await loginAs(page, residence.resident);
  await page.goto(`/resident/complaints/${complaint.complaintId}`);

  await expect(
    page.locator('.complaint-heading').getByText('처리완료'),
  ).toBeVisible();
  await expect(
    page.locator('.detail-aside').getByText('-', { exact: true }),
  ).toHaveCount(0);
});

test('입주민이 상태 필터를 고르면 그 상태의 민원만 보인다', async ({
  page,
}) => {
  await loginAs(page, residence.resident);
  await page.goto('/resident/complaints');
  const row = page.locator('.list-row', { hasText: complaint.title });
  await expect(row).toBeVisible();

  await segment(page, '완료').click();
  await expect(page.getByText('조건에 맞는 민원이 없어요')).toBeVisible();

  await segment(page, '처리전').click();
  await expect(row).toBeVisible();
});

test('관리자가 민원 제목으로 검색하면 맞는 민원만 보인다', async ({ page }) => {
  await loginAs(page, residence.manager);
  await page.goto('/manager/complaints');
  const search = page.getByRole('textbox', { name: '민원 제목 검색' });

  await search.fill('없는제목검색어');
  await search.press('Enter');
  await expect(page.getByText('조건에 맞는 민원이 없어요')).toBeVisible();

  await search.fill(complaint.title);
  await search.press('Enter');
  await expect(
    page.locator('.list-row', { hasText: complaint.title }),
  ).toBeVisible();
});

test('관리자는 처리 상태를 순서대로만 바꿀 수 있다', async ({ page }) => {
  await loginAs(page, residence.manager);
  await page.goto(`/manager/complaints/${complaint.complaintId}`);

  await expect(segment(page, '완료').locator('input')).toBeDisabled();
  await segment(page, '처리중').click();

  await expect(segment(page, '처리전').locator('input')).toBeDisabled();
  await expect(segment(page, '완료').locator('input')).toBeEnabled();
});

test('입주민이 민원 제목으로 검색하면 맞는 민원만 보인다', async ({ page }) => {
  await loginAs(page, residence.resident);
  await page.goto('/resident/complaints');
  const search = page.getByRole('textbox', { name: '민원 제목 검색' });

  await search.fill('없는제목검색어');
  await search.press('Enter');
  await expect(page.getByText('조건에 맞는 민원이 없어요')).toBeVisible();

  await search.fill(complaint.title);
  await search.press('Enter');
  await expect(
    page.locator('.list-row', { hasText: complaint.title }),
  ).toBeVisible();
});

test('관리자가 상태 필터를 고르면 그 상태의 민원만 보인다', async ({
  page,
}) => {
  await loginAs(page, residence.manager);
  await page.goto('/manager/complaints');
  const row = page.locator('.list-row', { hasText: complaint.title });
  await expect(row).toBeVisible();

  await segment(page, '처리중').click();
  await expect(page.getByText('조건에 맞는 민원이 없어요')).toBeVisible();

  await segment(page, '처리전').click();
  await expect(row).toBeVisible();
});
