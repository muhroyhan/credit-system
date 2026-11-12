import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_BROWSER_PATH
      ? { executablePath: process.env.PLAYWRIGHT_BROWSER_PATH }
      : {},
  },
  webServer: {
    command: 'bun apps/server/src/index.ts',
    port: 3100,
    env: { PORT: '3100', TZ: 'Asia/Jakarta' },
    reuseExistingServer: false,
  },
});
