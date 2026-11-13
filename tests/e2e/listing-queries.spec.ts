import { expect, test } from '@playwright/test';
import { loginBrowser } from './fixtures/login';

const password = process.env.SEED_PASSWORD;
test.skip(!password, 'Synthetic database required');

test('listing filters omit cleared values from requests', async ({ page }) => {
  await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
  for (const [link, label, endpoint, key] of [
    ['Admin User', 'Username', '/api/admin-user/list', 'username'],
    ['Perusahaan', 'Nama perusahaan', '/api/user/list', 'companyName'],
    ['Master Karyawan', 'Cari nama', '/api/debitor/list', 'namaLengkap'],
    ['Pengajuan Kredit', 'Nama', '/api/credit/list', 'nama'],
    ['Daftar Kredit Karyawan', 'Nama', '/api/credit/review/list', 'nama'],
  ] as const) {
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Urutkan' })).toBeVisible();
    const sorted = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoint &&
        new URL(response.url()).searchParams.get('sortDirection') === 'asc',
    );
    await page.getByRole('textbox', { name: 'Arah urutan' }).click();
    await page.getByRole('option', { name: 'Naik', exact: true }).click();
    expect((await sorted).ok()).toBe(true);
    const field = page.getByLabel(label, { exact: true });
    const filtered = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoint &&
        new URL(response.url()).searchParams.get(key) === 'sintetis',
    );
    await field.fill('sintetis');
    expect((await filtered).ok()).toBe(true);
    const cleared = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === endpoint &&
        !new URL(response.url()).searchParams.has(key),
    );
    await field.clear();
    expect((await cleared).ok()).toBe(true);
    await page.goBack();
  }
});
