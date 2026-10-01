import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';
const isLocal = new URL(baseURL).hostname === 'localhost';

export default defineConfig({
  testDir: './e2e',
  grep: isLocal ? undefined : /@readonly/,
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 120_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: isLocal
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        stderr: 'ignore',
      }
    : undefined,
});
