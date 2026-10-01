import { randomUUID } from 'node:crypto';
import {
  expect,
  request,
  type APIRequestContext,
  type APIResponse,
  type Page,
} from '@playwright/test';

export type Account = {
  email: string;
  password: string;
  accessToken: string;
};

export type Residence = {
  manager: Account;
  resident: Account;
  buildingName: string;
  roomNo: string;
};

export type CreatedComplaint = {
  complaintId: number;
  conversationId: number;
  title: string;
};

const agreements = [
  { termsType: 'SERVICE', isAgreed: true },
  { termsType: 'PRIVACY', isAgreed: true },
  { termsType: 'MARKETING', isAgreed: false },
];

const maxRateLimitRetries = 3;

function randomEmail() {
  return `e2e-${randomUUID()}@test.com`;
}

function randomPassword() {
  return `Aa1!${randomUUID().slice(0, 12)}`;
}

async function newApi() {
  return request.newContext({
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
  });
}

async function fetchWithRateLimitRetry(send: () => Promise<APIResponse>) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await send();
    if (response.status() !== 429 || attempt === maxRateLimitRetries)
      return response;
    const body = await response.json();
    const retryAfterSeconds = body.error?.details?.retryAfterSeconds ?? 30;
    await new Promise((resolve) =>
      setTimeout(resolve, retryAfterSeconds * 1000),
    );
  }
}

async function call<T>(
  api: APIRequestContext,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT',
  path: string,
  options: { token?: string; data?: unknown } = {},
): Promise<T> {
  const response = await fetchWithRateLimitRetry(() =>
    api.fetch(`/api/v1${path}`, {
      method,
      data: options.data,
      headers: options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {},
    }),
  );
  expect(
    response.ok(),
    `${method} ${path} 실패: ${await response.text()}`,
  ).toBeTruthy();
  const body = await response.json();
  return body.data as T;
}

async function signUpWithRole(
  api: APIRequestContext,
  role: 'MANAGER' | 'RESIDENT',
): Promise<Account> {
  const email = randomEmail();
  const password = randomPassword();
  await call(api, 'POST', '/auth/signup', {
    data: { email, password, passwordConfirm: password, agreements },
  });
  const login = await call<{ accessToken: string }>(
    api,
    'POST',
    '/auth/login',
    {
      data: { email, password },
    },
  );
  const selected = await call<{ accessToken: string }>(
    api,
    'PATCH',
    '/users/me',
    {
      token: login.accessToken,
      data: { userRole: role },
    },
  );
  return { email, password, accessToken: selected.accessToken };
}

export async function createUnconnectedResident(): Promise<Account> {
  const api = await newApi();
  try {
    return await signUpWithRole(api, 'RESIDENT');
  } finally {
    await api.dispose();
  }
}

export async function createResidence(): Promise<Residence> {
  const api = await newApi();
  try {
    const manager = await signUpWithRole(api, 'MANAGER');
    const buildingName = `빌딩${randomUUID().slice(0, 6)}`;
    await call(api, 'POST', '/managers/me/building', {
      token: manager.accessToken,
      data: { buildingName, roadAddress: '테스트 주소' },
    });
    const roomNo = '302';
    const created = await call<{ rooms: { roomId: number }[] }>(
      api,
      'POST',
      '/managers/me/building/rooms',
      {
        token: manager.accessToken,
        data: { roomNos: [roomNo] },
      },
    );
    const invitation = await call<{ code: string }>(
      api,
      'POST',
      `/managers/me/rooms/${created.rooms[0].roomId}/invitation-codes`,
      { token: manager.accessToken },
    );
    const resident = await signUpWithRole(api, 'RESIDENT');
    await call(api, 'PUT', '/residents/me/room', {
      token: resident.accessToken,
      data: { code: invitation.code },
    });
    return { manager, resident, buildingName, roomNo };
  } finally {
    await api.dispose();
  }
}

export async function createComplaint(
  resident: Account,
): Promise<CreatedComplaint> {
  const conversation = await startConversation(resident, '천장에서 물이 새요');
  await sendConversationMessage(
    resident,
    conversation.conversationId,
    '욕실 천장',
  );
  return submitComplaint(resident, conversation.conversationId);
}

export async function submitComplaint(
  resident: Account,
  conversationId: number,
) {
  const api = await newApi();
  try {
    return await call<CreatedComplaint>(
      api,
      'POST',
      '/residents/me/complaints',
      {
        token: resident.accessToken,
        data: { conversationId },
      },
    );
  } finally {
    await api.dispose();
  }
}

export async function startConversation(resident: Account, content: string) {
  const api = await newApi();
  try {
    return await call<{ conversationId: number }>(
      api,
      'POST',
      '/residents/me/conversations',
      {
        token: resident.accessToken,
        data: { content },
      },
    );
  } finally {
    await api.dispose();
  }
}

export async function loginAs(
  page: Page,
  account: Pick<Account, 'email' | 'password'>,
) {
  const response = await fetchWithRateLimitRetry(() =>
    page.request.post('/api/v1/auth/login', {
      data: { email: account.email, password: account.password },
    }),
  );
  expect(response.ok(), `로그인 실패: ${await response.text()}`).toBeTruthy();
}

export async function sendConversationMessage(
  resident: Account,
  conversationId: number,
  content: string,
) {
  const api = await newApi();
  try {
    await call(
      api,
      'POST',
      `/residents/me/conversations/${conversationId}/messages`,
      {
        token: resident.accessToken,
        data: { content },
      },
    );
  } finally {
    await api.dispose();
  }
}
