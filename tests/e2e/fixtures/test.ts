import { closeDatabase } from '@credit/database/client';
import { test as base } from '@playwright/test';

/** Releases the shared SQL pool only when the Playwright worker shuts down. */
export const test = base.extend<
  Record<never, never>,
  { databaseLifecycle: undefined }
>({
  databaseLifecycle: [
    async ({ browserName: _browserName }, use) => {
      await use(undefined);
      await closeDatabase();
    },
    { scope: 'worker', auto: true },
  ],
});
