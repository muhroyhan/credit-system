import { defineConfig } from '@playwright/test';
import { requireTestEnvironment } from './tests/setup/environment';

requireTestEnvironment();

export default defineConfig({
  workers: 1,
  projects: [
    { name: 'api', testDir: './tests/integration/http' },
    { name: 'browser', testDir: './tests/e2e' },
  ],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    timezoneId: 'Asia/Jakarta',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_BROWSER_PATH
      ? { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }
      : {},
  },
  webServer: {
    command: 'bun --no-env-file apps/server/src/index.ts',
    port: 3100,
    env: { PORT: '3100', TZ: 'Asia/Jakarta', BUN_ENV: 'test' },
    reuseExistingServer: false,
  },
});
