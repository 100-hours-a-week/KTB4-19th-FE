import { expect, test, type Page } from '@playwright/test';
import {
  createNotificationFixture,
  notificationRow,
} from './support/notificationFixture';

type Fixture = Awaited<ReturnType<typeof createNotificationFixture>>;
async function connect(page: Page, fixture: Fixture, role = 'manager') {
  await page.route('**/api/v1/**', (route) =>
    route.continue({
      url: `${fixture.url}${new URL(route.request().url()).pathname}${new URL(route.request().url()).search}`,
    }),
  );
  await page.goto(`/${role}/notifications`);
}
async function spa(page: Page, path: string) {
  await page.evaluate((url) => {
    history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}
for (const role of ['MANAGER', 'RESIDENT']) {
  test(`${role}: notifications wait for onboarding completion and home entry`, async ({
    page,
  }) => {
    const fixture = await createNotificationFixture();
    const notificationCalls = () =>
      fixture.state.calls.filter((call) =>
        call.path.startsWith('/users/me/notifications'),
      );
    const expectNoNotifications = async () => {
      await page.waitForTimeout(150);
      expect(notificationCalls()).toHaveLength(0);
    };
    try {
      fixture.state.role = 'NONE';
      fixture.state.buildingId = null;
      fixture.state.hasRooms = false;
      fixture.state.residentConnected = false;
      fixture.state.refreshStatus = 401;
      await page.route('**/api/v1/**', (route) =>
        route.continue({
          url: `${fixture.url}${new URL(route.request().url()).pathname}${new URL(route.request().url()).search}`,
        }),
      );
      await page.goto('/auth/login');
      await expect(
        page.getByRole('button', { name: '로그인', exact: true }),
      ).toBeVisible();
      fixture.state.refreshStatus = 200;
      await page
        .getByRole('textbox', { name: '이메일' })
        .fill('fixture2@example.com');
      await page.getByLabel('비밀번호', { exact: true }).fill('Fixture123!');
      await page.getByRole('button', { name: '로그인', exact: true }).click();
      await expect(page).toHaveURL(/\/auth\/role$/);
      await expectNoNotifications();
      await page
        .getByText(role === 'MANAGER' ? '관리자' : '입주민', { exact: true })
        .click();
      await page.getByRole('button', { name: '선택 완료' }).click();
      if (role === 'MANAGER') {
        await expect(page).toHaveURL(/\/manager\/building\/new$/);
        await expectNoNotifications();
        await page.evaluate(() =>
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
          }),
        );
        await page
          .getByRole('button', { name: '주소 검색', exact: true })
          .click();
        await page
          .getByRole('button', { name: '건물 등록', exact: true })
          .click();
        await expect(page).toHaveURL(/\/manager\/building\/rooms\/bulk$/);
        await expectNoNotifications();
        await page
          .getByRole('button', { name: '선택한 호실 5개 생성' })
          .click();
        await expect(
          page.getByRole('heading', { name: '호실 5개를 만들었어요' }),
        ).toBeVisible();
        await expectNoNotifications();
        await page.getByRole('button', { name: '관리자 홈으로' }).click();
      } else {
        await expect(page).toHaveURL(/\/resident\/connect$/);
        await expectNoNotifications();
        await page.getByLabel('초대코드', { exact: true }).fill('ABC123');
        await page.getByRole('button', { name: '코드 확인' }).click();
        await page.getByRole('button', { name: '맞아요, 연결할게요' }).click();
        await expect(
          page.getByRole('heading', { name: /연결됐어요/ }),
        ).toBeVisible();
        await expectNoNotifications();
        await page.getByRole('button', { name: '홈으로 가기' }).click();
      }
      await expect(page).toHaveURL(new RegExp(`/${role.toLowerCase()}$`));
      await expect.poll(() => fixture.state.streams.size).toBe(1);
      await expect(page.getByRole('status')).toHaveCount(0);
      expect(
        notificationCalls().filter((call) => call.path.endsWith('/stream')),
      ).toHaveLength(1);
      await page.getByRole('link', { name: /알림, 읽지 않은 알림/ }).click();
      await expect(page.locator('.notification-row')).toHaveCount(1);
      expect(
        notificationCalls().filter((call) => call.path.endsWith('/stream')),
      ).toHaveLength(1);
    } finally {
      await page.close();
      await fixture.close();
    }
  });
}
for (const role of ['manager', 'resident']) {
  for (const width of [1280, 390]) {
    test(`${role} ${width}px: snapshot, explicit read, failure, pagination and accessible bell`, async ({
      page,
    }, info) => {
      const fixture = await createNotificationFixture();
      try {
        fixture.state.role = role.toUpperCase();
        fixture.state.rows = Array.from({ length: 21 }, (_, index) =>
          notificationRow(7001 - index, fixture.state.role),
        );
        await page.setViewportSize({ width, height: 844 });
        await connect(page, fixture, role);
        const title = '계정1 천장 누수 7001';
        await expect(
          page.getByRole('link', { name: '알림, 읽지 않은 알림 21개' }),
        ).toBeVisible();
        await expect(page.locator('.notification-row')).toHaveCount(20);
        await expect(
          page.locator('.notification-row').first().getByRole('link'),
        ).toHaveAttribute('href', `/${role}/complaints/7021`);
        expect(
          fixture.state.calls.filter((call) => call.method === 'PATCH'),
        ).toHaveLength(0);
        await expect(
          page.getByRole('button', { name: '모두 읽음' }),
        ).toHaveCount(0);
        fixture.state.patchStatus = 500;
        await page
          .getByRole('button', { name: `${title} 알림 읽음 처리` })
          .click();
        await expect(page.getByRole('alert')).toContainText('읽음 처리에 실패');
        await expect(
          page.getByRole('link', { name: '알림, 읽지 않은 알림 21개' }),
        ).toBeVisible();
        fixture.state.patchStatus = 200;
        await page
          .getByRole('button', { name: `${title} 알림 읽음 처리` })
          .click();
        await expect(
          page.getByRole('link', { name: '알림, 읽지 않은 알림 20개' }),
        ).toBeVisible();
        expect(fixture.state.rows[0].readAt).toBe('2026-10-07T19:00:00+09:00');
        await expect(
          page.getByRole('button', { name: `${title} 알림 읽음 처리` }),
        ).toHaveCount(0);
        await page.getByRole('button', { name: '더 보기' }).click();
        await expect(page.locator('.notification-row')).toHaveCount(21);
        const box = await page
          .locator('.notification-row')
          .first()
          .boundingBox();
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath('notifications.png'),
          fullPage: false,
        });
      } finally {
        await page.close();
        await fixture.close();
      }
    });
  }
}
test('SSE signal, out-of-order ID, reconnect, page overlap and menu navigation share one stream', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    fixture.state.rows = Array.from({ length: 21 }, (_, index) =>
      notificationRow(7001 - index),
    );
    await connect(page, fixture);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    const initialStreams = fixture.state.calls.filter((call) =>
      call.path.endsWith('/stream'),
    ).length;
    await spa(page, '/manager/complaints');
    await expect(
      page.getByRole('heading', { name: '민원 목록' }),
    ).toBeVisible();
    await page.getByRole('link', { name: '알림, 읽지 않은 알림 21개' }).click();
    expect(
      fixture.state.calls.filter((call) => call.path.endsWith('/stream'))
        .length,
    ).toBe(initialStreams);
    fixture.state.rows.unshift(notificationRow(8000));
    await page.getByRole('button', { name: '더 보기' }).click();
    await expect(page.locator('.notification-row')).toHaveCount(21);
    fixture.signal(8000);
    await expect(page.locator('.notification-row')).toHaveCount(22);
    await expect(page.locator('.notification-row').first()).toContainText(
      '천장 누수 8000',
    );
    fixture.state.rows.unshift(notificationRow(9000));
    fixture.signal(1);
    await expect(page.locator('.notification-row').first()).toContainText(
      '천장 누수 9000',
    );
    fixture.disconnect();
    fixture.state.rows.unshift(notificationRow(10000));
    await expect(page.locator('.notification-row').first()).toContainText(
      '천장 누수 10000',
    );
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    expect(fixture.state.maxStreams).toBe(1);
  } finally {
    await page.close();
    await fixture.close();
  }
});
test('focus and visibility changes do not refetch stale notifications; SSE and manual refresh still sync', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    await page.clock.install();
    await connect(page, fixture);
    await expect(page.locator('.notification-row')).toHaveCount(1);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    await page.waitForTimeout(250);
    const notificationCalls = () =>
      fixture.state.calls.filter((call) =>
        call.path.startsWith('/users/me/notifications'),
      ).length;
    const initial = notificationCalls();
    fixture.state.rows.unshift(notificationRow(8000));
    await page.clock.fastForward(31_000);
    for (let index = 0; index < 3; index++) {
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(150);
    }
    expect(notificationCalls()).toBe(initial);
    await expect(page.locator('.notification-row')).toHaveCount(1);
    fixture.signal(8000);
    await expect(page.locator('.notification-row')).toHaveCount(2);
    await expect(
      page.getByRole('link', { name: '알림, 읽지 않은 알림 2개' }),
    ).toBeVisible();
    fixture.state.rows.unshift(notificationRow(9000));
    const beforeRefresh = notificationCalls();
    const streamsBeforeRefresh = fixture.state.calls.filter((call) =>
      call.path.endsWith('/stream'),
    ).length;
    await page.getByRole('button', { name: '새로고침', exact: true }).click();
    await expect(page.locator('.notification-row')).toHaveCount(3);
    await expect(
      page.getByRole('link', { name: '알림, 읽지 않은 알림 3개' }),
    ).toBeVisible();
    await page.waitForTimeout(150);
    expect(
      fixture.state.calls.filter((call) => call.path.endsWith('/stream'))
        .length,
    ).toBe(streamsBeforeRefresh);
    expect(notificationCalls()).toBe(beforeRefresh + 2);
  } finally {
    await page.close();
    await fixture.close();
  }
});
for (const status of [403, 404]) {
  test(`${status}: no automatic loop/logout; list and manual retry recover`, async ({
    page,
  }) => {
    const fixture = await createNotificationFixture();
    try {
      fixture.state.streamStatus = status;
      await connect(page, fixture);
      await expect(page.getByRole('status')).toContainText(
        '실시간 알림에 연결할 수 없어요',
      );
      await expect(page.locator('.notification-row')).toHaveCount(1);
      const calls = fixture.state.calls.filter((call) =>
        call.path.endsWith('/stream'),
      ).length;
      await page.waitForTimeout(1100);
      expect(
        fixture.state.calls.filter((call) => call.path.endsWith('/stream'))
          .length,
      ).toBe(calls);
      fixture.state.streamStatus = 200;
      fixture.state.rows.unshift(notificationRow(8000));
      await page.getByRole('button', { name: '새로고침', exact: true }).click();
      await expect(page.locator('.notification-row')).toHaveCount(2);
      expect(
        fixture.state.calls.filter((call) => call.path.endsWith('/stream'))
          .length,
      ).toBe(calls);
      await page.getByRole('button', { name: '다시 연결' }).click();
      await expect.poll(() => fixture.state.streams.size).toBe(1);
      await expect(page.getByRole('status')).toHaveCount(0);
    } finally {
      await page.close();
      await fixture.close();
    }
  });
}
for (const failure of [false, true]) {
  test(`account change delayed onboarding, failure=${failure}: no B queries under A session`, async ({
    page,
  }) => {
    const fixture = await createNotificationFixture();
    try {
      await connect(page, fixture);
      await expect(page.locator('.notification-row')).toHaveCount(1);
      await spa(page, '/auth/login');
      fixture.state.holdOnboarding = true;
      fixture.state.failOnboarding = failure;
      await page
        .getByRole('textbox', { name: '이메일' })
        .fill('fixture2@example.com');
      await page.getByLabel('비밀번호', { exact: true }).fill('Fixture123!');
      await page.getByRole('button', { name: '로그인', exact: true }).click();
      await expect
        .poll(() =>
          fixture.state.calls.some(
            (call) =>
              call.path === '/users/me/onboarding-status' && call.user === 2,
          ),
        )
        .toBe(true);
      await expect.poll(() => fixture.state.streams.size).toBe(0);
      expect(
        fixture.state.calls.filter(
          (call) =>
            call.path.startsWith('/users/me/notifications') && call.user === 2,
        ),
      ).toHaveLength(0);
      fixture.state.releaseOnboarding();
      if (failure) {
        await expect(
          page.getByText('로그인하지 못했어요. 잠시 후 다시 시도해 주세요.'),
        ).toBeVisible();
        await expect(
          page.getByRole('heading', { name: '로그인', exact: true }),
        ).toBeVisible();
        await expect.poll(() => fixture.state.streams.size).toBe(0);
        await spa(page, '/manager/notifications');
        await expect(page).toHaveURL(/\/auth\/login/);
      } else {
        await expect(page).toHaveURL(/\/manager$/);
        await page
          .getByRole('link', { name: '알림, 읽지 않은 알림 1개' })
          .click();
        await expect(page.locator('.notification-row')).toContainText('계정2');
        await expect(page.locator('.notification-row')).not.toContainText(
          '계정1',
        );
      }
    } finally {
      await page.close();
      await fixture.close();
    }
  });
}
test('401 single refresh failure becomes anonymous; old stream and caches do not return', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    await connect(page, fixture);
    await expect(page.locator('.notification-row')).toHaveCount(1);
    fixture.state.streamStatus = 401;
    fixture.state.refreshStatus = 401;
    fixture.disconnect();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect.poll(() => fixture.state.streams.size).toBe(0);
    expect(
      fixture.state.calls.filter((call) => call.path === '/auth/reissue'),
    ).toHaveLength(2);
    await expect(page.locator('.notification-row')).toHaveCount(0);
  } finally {
    await page.close();
    await fixture.close();
  }
});

test('concurrent list/count/SSE 401 share one refresh and replace one stream', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    await connect(page, fixture);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    fixture.state.holdRefresh = true;
    fixture.state.queryStatus = 401;
    fixture.state.streamStatus = 401;
    await page.getByRole('button', { name: '새로고침' }).click();
    fixture.disconnect();
    await expect
      .poll(
        () =>
          fixture.state.calls.filter((call) => call.path === '/auth/reissue')
            .length,
      )
      .toBe(2);
    await expect
      .poll(
        () =>
          fixture.state.calls.filter((call) =>
            call.path.startsWith('/users/me/notifications'),
          ).length,
      )
      .toBeGreaterThan(5);
    await expect
      .poll(
        () =>
          fixture.state.calls.filter((call) => call.path.endsWith('/stream'))
            .length,
      )
      .toBe(2);
    fixture.state.queryStatus = 200;
    fixture.state.streamStatus = 200;
    fixture.state.holdRefresh = false;
    fixture.state.releaseRefresh();
    await expect(page.locator('.notification-row')).toHaveCount(1);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    expect(
      fixture.state.calls.filter((call) => call.path === '/auth/reissue'),
    ).toHaveLength(2);
    expect(fixture.state.maxStreams).toBe(1);
  } finally {
    await page.close();
    await fixture.close();
  }
});
test('logout during slow refresh wins over its late token; cache and stream stay stopped', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    await connect(page, fixture);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
    fixture.state.holdRefresh = true;
    fixture.state.streamStatus = 401;
    fixture.disconnect();
    await expect
      .poll(
        () =>
          fixture.state.calls.filter((call) => call.path === '/auth/reissue')
            .length,
      )
      .toBe(2);
    await spa(page, '/manager/mypage');
    await page.getByRole('button', { name: '로그아웃', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    fixture.state.holdRefresh = false;
    fixture.state.streamStatus = 200;
    fixture.state.releaseRefresh();
    await expect.poll(() => fixture.state.streams.size).toBe(0);
    await page.waitForTimeout(1100);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('.notification-row')).toHaveCount(0);
  } finally {
    await page.close();
    await fixture.close();
  }
});
for (const anonymous of [false, true]) {
  test(`ineligible session anonymous=${anonymous} opens no notifications`, async ({
    page,
  }) => {
    const fixture = await createNotificationFixture();
    try {
      if (anonymous) fixture.state.refreshStatus = 401;
      else fixture.state.role = 'NONE';
      await connect(page, fixture);
      await expect(page).toHaveURL(
        anonymous ? /\/auth\/login/ : /\/auth\/role/,
      );
      expect(
        fixture.state.calls.filter((call) =>
          call.path.startsWith('/users/me/notifications'),
        ),
      ).toHaveLength(0);
    } finally {
      await page.close();
      await fixture.close();
    }
  });
}
test('eligibility 403 on list/count keeps session, hides stale rows/count and recovers manually', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    await connect(page, fixture);
    await expect(page.locator('.notification-row')).toHaveCount(1);
    fixture.state.queryStatus = 403;
    fixture.state.streamStatus = 403;
    await page.getByRole('button', { name: '새로고침' }).click();
    await expect(
      page.getByRole('heading', { name: '내용을 불러오지 못했어요' }),
    ).toBeVisible();
    await expect(page.locator('.notification-row')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: '알림, 미읽음 수 확인 불가' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/manager\/notifications/);
    fixture.state.queryStatus = 200;
    fixture.state.streamStatus = 200;
    await page.getByRole('button', { name: '다시 시도', exact: true }).click();
    await expect(page.locator('.notification-row')).toHaveCount(1);
    await expect.poll(() => fixture.state.streams.size).toBe(1);
  } finally {
    await page.close();
    await fixture.close();
  }
});
test('late initial session restore cannot overwrite a newly logged-in account', async ({
  page,
}) => {
  const fixture = await createNotificationFixture();
  try {
    fixture.state.holdMe = true;
    await page.route('**/api/v1/**', (route) =>
      route.continue({
        url: `${fixture.url}${new URL(route.request().url()).pathname}${new URL(route.request().url()).search}`,
      }),
    );
    await page.goto('/auth/login');
    await expect
      .poll(() => fixture.state.calls.some((call) => call.path === '/users/me'))
      .toBe(true);
    await page
      .getByRole('textbox', { name: '이메일' })
      .fill('fixture2@example.com');
    await page.getByLabel('비밀번호', { exact: true }).fill('Fixture123!');
    await page.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(page).toHaveURL(/\/manager$/);
    await expect(page.locator('.sidebar-profile')).toContainText(
      'fixture2@example.com',
    );
    fixture.state.releaseMe();
    await page.waitForTimeout(200);
    await expect(page.locator('.sidebar-profile')).toContainText(
      'fixture2@example.com',
    );
  } finally {
    await page.close();
    await fixture.close();
  }
});
