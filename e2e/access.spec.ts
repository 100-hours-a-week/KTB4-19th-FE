import { expect, test } from '@playwright/test';
import {
  createComplaint,
  createResidence,
  createUnconnectedResident,
  loginAs,
  startConversation,
} from './support/api';

test('로그인하지 않으면 로그인 화면으로 이동한다', async ({ page }) => {
  await page.goto('/resident/conversations');

  await expect(page).toHaveURL('/auth/login');
});

test('다른 입주민의 대화 주소로 들어가면 접근 불가 안내가 보인다', async ({
  page,
}) => {
  const owner = await createResidence();
  const other = await createResidence();
  const conversation = await startConversation(
    owner.resident,
    '천장에서 물이 새요',
  );

  await loginAs(page, other.resident);
  await page.goto(`/resident/conversations/${conversation.conversationId}`);

  await expect(page.getByText('이 대화에 접근할 수 없어요')).toBeVisible();
  await expect(page.getByText('천장에서 물이 새요')).toHaveCount(0);
});

test('다른 입주민의 민원 주소로 들어가면 접근 불가 안내가 보인다', async ({
  page,
}) => {
  const owner = await createResidence();
  const other = await createResidence();
  const complaint = await createComplaint(owner.resident);

  await loginAs(page, other.resident);
  await page.goto(`/resident/complaints/${complaint.complaintId}`);

  await expect(page.getByText('이 민원에 접근할 수 없어요')).toBeVisible();
  await expect(page.getByText(complaint.title)).toHaveCount(0);
});

test('다른 건물 관리자의 민원 목록에는 보이지 않는다', async ({ page }) => {
  const owner = await createResidence();
  const other = await createResidence();
  const complaint = await createComplaint(owner.resident);

  await loginAs(page, other.manager);
  await page.goto('/manager/complaints');

  await expect(page.getByText('조건에 맞는 민원이 없어요')).toBeVisible();
  await expect(page.getByText(complaint.title)).toHaveCount(0);
});

test('다른 건물 관리자는 민원의 대화 원본을 볼 수 없다', async ({ page }) => {
  const owner = await createResidence();
  const other = await createResidence();
  const complaint = await createComplaint(owner.resident);

  await loginAs(page, other.manager);
  await page.goto(`/manager/conversations/${complaint.conversationId}`);

  await expect(page.getByText('이 대화에 접근할 수 없어요')).toBeVisible();
  await expect(page.getByText('천장에서 물이 새요')).toHaveCount(0);
});

test('입주민은 관리자 화면에 들어갈 수 없다', async ({ page }) => {
  const residence = await createResidence();

  await loginAs(page, residence.resident);
  await page.goto('/manager/complaints');

  await expect(page).toHaveURL('/resident');
});

test('입주 연결 전인 입주민이 대화 화면에 들어가면 입주 연결 화면으로 이동한다', async ({
  page,
}) => {
  const resident = await createUnconnectedResident();

  await loginAs(page, resident);
  await page.goto('/resident/conversations');

  await expect(page).toHaveURL('/resident/connect');
});

test('없는 민원 번호로 들어가면 민원을 찾을 수 없다는 안내가 보인다', async ({
  page,
}) => {
  const { resident } = await createResidence();

  await loginAs(page, resident);
  await page.goto('/resident/complaints/999999999');

  await expect(
    page.getByRole('heading', { name: '민원을 찾을 수 없어요' }),
  ).toBeVisible();
});

test('관리자는 입주민 화면에 들어갈 수 없다', async ({ page }) => {
  const { manager } = await createResidence();

  await loginAs(page, manager);
  await page.goto('/resident/conversations');

  await expect(page).toHaveURL('/manager');
});

test('잘못된 대화 주소로 들어가면 대화를 찾을 수 없다는 안내가 보인다', async ({
  page,
}) => {
  const { resident } = await createResidence();

  await loginAs(page, resident);
  await page.goto('/resident/conversations/abc');

  await expect(
    page.getByRole('heading', { name: '대화를 찾을 수 없어요' }),
  ).toBeVisible();
});
