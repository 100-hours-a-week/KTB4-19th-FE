import { expect, test, type Page } from '@playwright/test';

const paths = ['/manager/complaints', '/manager/documents'];
const missing = { status: 404, code: 'BUILDING_NOT_FOUND' };
type Failure = { status: number; code: string };

// Local HTTP fixtures only. No account, building, or document is created on BE.
async function fixture(
  page: Page,
  options: {
    building?: Failure | 'ready' | 'loading';
    list?: Failure;
    staleOnboarding?: boolean;
    resident?: boolean;
  } = {},
) {
  let registered = options.building === 'ready';
  let listCalls = 0;
  let buildingCalls = 0;
  let roomCalls = 0;
  let releaseBuilding!: () => void;
  const buildingWait = new Promise<void>((resolve) => {
    releaseBuilding = resolve;
  });
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/v1', '');
    const data = (value: unknown) => route.fulfill({ json: { data: value } });
    const fail = (failure: Failure) =>
      failure.status === 0
        ? route.abort('failed')
        : route.fulfill({
            status: failure.status,
            json: {
              data: null,
              message: 'fixture error',
              error: { code: failure.code },
            },
          });
    if (path === '/auth/reissue')
      return data({ accessToken: 'fixture-token', tokenType: 'Bearer' });
    if (path === '/users/me')
      return data({
        userId: 1,
        userRole: options.resident ? 'RESIDENT' : 'MANAGER',
        email: 'fixture@example.com',
        userName: '테스트 관리자',
      });
    if (path === '/users/me/onboarding-status')
      return data({
        userRole: options.resident ? 'RESIDENT' : 'MANAGER',
        buildingId: registered ? 1 : null,
        hasRooms: false,
        residentConnected: !!options.resident,
        nextStep: options.resident
          ? 'HOME'
          : registered && !options.staleOnboarding
            ? 'ROOM_REGISTRATION'
            : 'BUILDING_REGISTRATION',
      });
    if (path === '/managers/me/building') {
      const building = {
        buildingId: 1,
        buildingName: '테스트 건물',
        roadAddress: '서울 테스트로 1',
      };
      if (request.method() === 'POST') {
        registered = true;
        return data(building);
      }
      buildingCalls += 1;
      if (options.building === 'loading') await buildingWait;
      if (typeof options.building === 'object') return fail(options.building);
      return registered
        ? data({
            ...building,
            totalRoomCount: 0,
            updatedAt: '2026-10-06T00:00:00',
          })
        : fail(missing);
    }
    if (
      path === '/managers/me/building/rooms' ||
      path === '/managers/me/building/rooms/summary'
    ) {
      roomCalls += 1;
      if (options.building === 'loading') await buildingWait;
      if (!registered) return fail(missing);
      return data(
        path.endsWith('/summary')
          ? { livingCount: 0, invitedCount: 0, emptyCount: 0, totalCount: 0 }
          : {
              buildingId: 1,
              buildingName: '테스트 건물',
              totalCount: 0,
              rooms: [],
            },
      );
    }
    if (
      path === '/managers/me/complaints' ||
      path === '/managers/me/documents'
    ) {
      listCalls += 1;
      if (options.list) return fail(options.list);
      if (!registered)
        return fail(
          path.endsWith('/complaints')
            ? { status: 403, code: 'FORBIDDEN' }
            : missing,
        );
      return data(
        path.endsWith('/complaints')
          ? {
              complaints: [],
              totalCount: 0,
              page: 0,
              pageSize: 20,
              hasNext: false,
            }
          : [],
      );
    }
    if (path === '/residents/me/complaints')
      return data({
        complaints: [],
        totalCount: 0,
        page: 0,
        pageSize: 20,
        hasNext: false,
      });
    return fail({ status: 500, code: 'UNEXPECTED_FIXTURE_REQUEST' });
  });
  return {
    get listCalls() {
      return listCalls;
    },
    get buildingCalls() {
      return buildingCalls;
    },
    get roomCalls() {
      return roomCalls;
    },
    releaseBuilding,
  };
}

for (const path of paths) {
  test(`${path}: 건물 미등록 직접 진입과 메뉴 이동에서 등록 링크 제공`, async ({
    page,
  }, testInfo) => {
    const api = await fixture(page);
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: '건물 정보가 필요해요' }),
    ).toBeVisible();
    const link = page.getByRole('link', { name: '건물 등록으로 이동' });
    await expect(link).toHaveAttribute('href', '/manager/building/new');
    await page.screenshot({
      path: testInfo.outputPath('building-required-desktop.png'),
      fullPage: true,
    });
    expect(api.listCalls).toBe(0);
    const other = path.endsWith('/complaints') ? '운영규칙' : '민원';
    await page.getByRole('link', { name: other, exact: true }).first().click();
    await expect(
      page.getByRole('heading', { name: '건물 정보가 필요해요' }),
    ).toBeVisible();
    expect(api.listCalls).toBe(0);
    await link.click();
    await expect(page).toHaveURL('/manager/building/new');
    await expect(
      page.getByRole('heading', { name: '관리할 건물을 등록해 주세요' }),
    ).toBeVisible();
  });

  test(`${path}: 건물 조회 대기 중 목록 호출하지 않음`, async ({ page }) => {
    const api = await fixture(page, { building: 'loading' });
    await page.goto(path);
    await expect.poll(() => api.buildingCalls).toBe(1);
    await expect(page.getByRole('status')).toBeVisible();
    expect(api.listCalls).toBe(0);
    api.releaseBuilding();
    await expect(
      page.getByRole('heading', { name: '건물 정보가 필요해요' }),
    ).toBeVisible();
  });

  test(`${path}: 목록의 BUILDING_NOT_FOUND만으로 건물 미등록 판단하지 않음`, async ({
    page,
  }) => {
    await fixture(page, { building: 'ready', list: missing });
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: '내용을 불러오지 못했어요' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '건물 등록으로 이동' }),
    ).toHaveCount(0);
  });

  test(`${path}: 건물 있고 호실 없고 onboarding 스냅샷 오래돼도 빈 목록 유지`, async ({
    page,
  }) => {
    const api = await fixture(page, {
      building: 'ready',
      staleOnboarding: true,
    });
    await page.goto(path);
    await expect(
      page.getByRole('heading', {
        name: path.endsWith('/complaints')
          ? '조건에 맞는 민원이 없어요'
          : '등록된 운영규칙이 없어요',
      }),
    ).toBeVisible();
    expect(api.listCalls).toBeGreaterThan(0);
    await expect(
      page.getByRole('link', { name: '건물 등록으로 이동' }),
    ).toHaveCount(0);
  });

  for (const failure of [
    { status: 403, code: 'FORBIDDEN' },
    { status: 404, code: 'DOCUMENT_NOT_FOUND' },
    { status: 500, code: 'INTERNAL_SERVER_ERROR' },
    { status: 0, code: 'NETWORK_ERROR' },
  ]) {
    for (const source of ['building', 'list'] as const) {
      test(`${path}: ${source} ${failure.status} ${failure.code} 건물 미등록 오인 없음`, async ({
        page,
      }) => {
        const api = await fixture(
          page,
          source === 'building'
            ? { building: failure }
            : { building: 'ready', list: failure },
        );
        await page.goto(path);
        await expect(
          page.getByRole('heading', { name: '내용을 불러오지 못했어요' }),
        ).toBeVisible();
        await expect(
          page.getByRole('link', { name: '건물 등록으로 이동' }),
        ).toHaveCount(0);
        const calls = source === 'building' ? api.buildingCalls : api.listCalls;
        await page.getByRole('button', { name: '다시 시도' }).click();
        await expect
          .poll(() =>
            source === 'building' ? api.buildingCalls : api.listCalls,
          )
          .toBeGreaterThan(calls);
        if (source === 'building') expect(api.listCalls).toBe(0);
      });
    }
  }

  test(`${path}: 등록 성공 후 같은 세션에서 건물 재조회하고 정상 목록 복귀`, async ({
    page,
  }) => {
    const api = await fixture(page);
    await page.goto(path);
    await page.getByRole('link', { name: '건물 등록으로 이동' }).click();
    // Isolated address widget fixture; production address lookup is not called.
    await page.evaluate(() => {
      Object.assign(window, {
        daum: {
          Postcode: class {
            complete: () => void;
            constructor(options: {
              oncomplete: (value: {
                roadAddress: string;
                jibunAddress: string;
              }) => void;
            }) {
              this.complete = () =>
                options.oncomplete({
                  roadAddress: '서울 테스트로 1',
                  jibunAddress: '',
                });
            }
            open() {
              this.complete();
            }
          },
        },
      });
    });
    await page.getByRole('button', { name: '주소 검색', exact: true }).click();
    await page.getByRole('button', { name: '건물 등록', exact: true }).click();
    await expect(page).toHaveURL('/manager/building/rooms/bulk');
    const calls = api.buildingCalls;
    // Return through SPA navigation without reloading or clearing React Query.
    await page.getByRole('link', { name: 'zipsAI', exact: true }).click();
    await page
      .getByRole('link', {
        name: path.endsWith('/complaints') ? '민원' : '운영규칙',
        exact: true,
      })
      .first()
      .click();
    await expect(
      page.getByRole('heading', {
        name: path.endsWith('/complaints')
          ? '조건에 맞는 민원이 없어요'
          : '등록된 운영규칙이 없어요',
      }),
    ).toBeVisible();
    expect(api.buildingCalls).toBeGreaterThan(calls);
  });
}

test('입주민 민원 목록은 관리자 건물 조회 없이 기존 빈 목록 표시', async ({
  page,
}) => {
  const api = await fixture(page, { resident: true });
  await page.goto('/resident/complaints');
  await expect(
    page.getByRole('heading', { name: '조건에 맞는 민원이 없어요' }),
  ).toBeVisible();
  expect(api.buildingCalls).toBe(0);
});

test.describe('모바일 건물 미등록 안내', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const path of paths) {
    test(`${path}: 안내·등록 링크·메뉴와 등록 화면 도달`, async ({
      page,
    }, testInfo) => {
      const api = await fixture(page);
      await page.goto(path);
      await expect(
        page.getByRole('heading', { name: '건물 정보가 필요해요' }),
      ).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: '모바일 메뉴' }),
      ).toBeVisible();
      const link = page.getByRole('link', { name: '건물 등록으로 이동' });
      await expect(link).toBeVisible();
      const bounds = await link.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
      await page.screenshot({
        path: testInfo.outputPath('building-required-mobile.png'),
        fullPage: true,
      });
      await page
        .getByRole('link', {
          name: path.endsWith('/complaints') ? '운영규칙' : '민원',
          exact: true,
        })
        .click();
      await expect(
        page.getByRole('heading', { name: '건물 정보가 필요해요' }),
      ).toBeVisible();
      expect(api.listCalls).toBe(0);
      await link.click();
      await expect(page).toHaveURL('/manager/building/new');
      await expect(
        page.getByRole('heading', { name: '관리할 건물을 등록해 주세요' }),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath('building-register-mobile.png'),
        fullPage: true,
      });
    });
  }
});

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
]) {
  test(`호실 ${viewport.width}px: 건물 확인 중 기본 UI 노출하지 않음`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const api = await fixture(page, { building: 'loading' });
    await page.goto('/manager/rooms');
    await expect
      .poll(() => api.buildingCalls + api.roomCalls)
      .toBeGreaterThan(0);
    await expect(page.getByRole('heading', { name: '호실 현황' })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole('radiogroup', { name: '호실 상태' }),
    ).toHaveCount(0);
    await expect(page.locator('.metrics-grid')).toHaveCount(0);
    await expect(page.getByRole('status')).toBeVisible();
    expect(api.roomCalls).toBe(0);
    api.releaseBuilding();
    await expect(
      page.getByRole('heading', { name: '건물 정보가 필요해요' }),
    ).toBeVisible();
  });
}

for (const path of paths) {
  test(`호실 메뉴 ${path}에서 진입: 안내 전후 기본 UI 노출하지 않음`, async ({
    page,
  }) => {
    const api = await fixture(page);
    await page.goto(path);
    await page.getByRole('link', { name: '건물 등록으로 이동' }).waitFor();
    // Detect even a brief render between the menu click and the final notice.
    await page.evaluate(() => {
      document.documentElement.dataset.roomUiFlashed = 'false';
      new MutationObserver(() => {
        if (document.querySelector('.metrics-grid, [aria-label="호실 상태"]')) {
          document.documentElement.dataset.roomUiFlashed = 'true';
        }
      }).observe(document.body, { childList: true, subtree: true });
    });
    await page.getByRole('link', { name: '호실', exact: true }).first().click();
    await expect(page).toHaveURL('/manager/rooms');
    await expect(
      page.getByRole('heading', { name: '건물 정보가 필요해요' }),
    ).toBeVisible();
    expect(
      await page.locator('html').getAttribute('data-room-ui-flashed'),
    ).toBe('false');
    expect(api.roomCalls).toBe(0);
    await page.getByRole('link', { name: '건물 등록으로 이동' }).click();
    await expect(
      page.getByRole('heading', { name: '관리할 건물을 등록해 주세요' }),
    ).toBeVisible();
  });
}

test('호실: 건물 있고 호실 없는 관리자는 기존 빈 목록 표시', async ({
  page,
}) => {
  const api = await fixture(page, { building: 'ready' });
  await page.goto('/manager/rooms');
  await expect(page.getByRole('heading', { name: '호실 현황' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '조건에 맞는 호실이 없어요' }),
  ).toBeVisible();
  await expect(
    page.getByRole('radiogroup', { name: '호실 상태' }),
  ).toBeVisible();
  expect(api.roomCalls).toBe(2);
});
