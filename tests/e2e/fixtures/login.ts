import { type APIRequestContext, expect, type Page } from '@playwright/test';
import type { BrowserLogin, TestLogin } from './fixture.type';

/** Logs in through the real API; intended for setup, not login acceptance assertions. */
export async function loginHeaders(
  request: APIRequestContext,
  input: TestLogin,
) {
  const response = await request.post('/api/login', {
    data: { ...input, password: input.password ?? process.env.SEED_PASSWORD },
  });
  expect(response.status()).toBe(200);
  const body: unknown = await response.json();
  if (
    typeof body !== 'object' ||
    body === null ||
    !('authToken' in body) ||
    typeof body.authToken !== 'string'
  ) {
    throw new Error('Login response must contain an auth token');
  }
  return { Authorization: `Bearer ${body.authToken}` };
}

/** Uses visible login controls so feature tests still exercise a real browser session. */
export async function loginBrowser(page: Page, input: BrowserLogin) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Jenis akun' }).click();
  const label =
    input.type === 'admin'
      ? 'Admin bank'
      : input.type === 'company'
        ? 'Perusahaan / HRD'
        : 'Debitor';
  await page.getByRole('option', { name: label, exact: true }).click();
  if (input.type !== 'admin') {
    await page.getByRole('textbox', { name: 'Perusahaan' }).click();
    await page
      .getByRole('option', {
        name: input.companyName ?? 'Perusahaan Sintetis Satu',
        exact: true,
      })
      .click();
  }
  await page.getByLabel('Username atau email').fill(input.username);
  await page
    .getByLabel(/^Password/)
    .fill(input.password ?? process.env.SEED_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
}
