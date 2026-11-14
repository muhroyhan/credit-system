import { expect, test } from '@playwright/test';

const password = process.env.SEED_PASSWORD;
test('admin can sign in and sign out', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByText('Masuk sebagai admin')).toBeVisible();
  await page.getByRole('button', { name: 'Keluar' }).click();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});

test('AUTH-E wrong credentials show a real server error and allow retry', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill('incorrect');
  const denied = page.waitForResponse((response) =>
    response.url().endsWith('/api/login'),
  );
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  expect((await denied).status()).toBe(401);
  await expect(page.getByRole('alert')).toContainText(
    'Login gagal. Periksa kredensial dan perusahaan.',
  );
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByText('Masuk sebagai admin')).toBeVisible();
});

test('AUTH-E reload keeps the current page until logout', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Admin User', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/admin-users$/);
  await expect(
    page.getByRole('heading', { name: 'Admin User', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Keluar' }).click();
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('button', { name: 'Masuk', exact: true }),
  ).toBeVisible();
});

test('tenant actors can sign in', async ({ page }) => {
  for (const actor of [
    { label: 'Perusahaan / HRD', username: 'hrd_satu', result: 'company' },
    { label: 'Debitor', username: 'debitor_satu', result: 'debitor' },
  ]) {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Jenis akun' }).click();
    await page.getByRole('option', { name: actor.label }).click();
    await page.getByRole('textbox', { name: 'Perusahaan' }).click();
    await page
      .getByRole('option', { name: 'Perusahaan Sintetis Satu' })
      .click();
    await page.getByLabel('Username atau email').fill(actor.username);
    await page.getByLabel('Password').fill(password ?? '');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.getByText(`Masuk sebagai ${actor.result}`)).toBeVisible();
    await page.getByRole('button', { name: 'Keluar' }).click();
  }
});

test('expired saved session redirects to login on reload', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByText('Masuk sebagai admin')).toBeVisible();
  await page.evaluate(() => {
    const raw = sessionStorage.getItem('credit-system.session');
    if (!raw) {
      throw new Error('Missing saved session');
    }
    const session = JSON.parse(raw);
    session.authToken = `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`;
    sessionStorage.setItem('credit-system.session', JSON.stringify(session));
  });
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(() => sessionStorage.getItem('credit-system.session')),
  ).toBeNull();
});

test('AUTH-E unknown browser path displays the not-found page', async ({
  page,
}) => {
  await page.goto('/unavailable');
  await expect(page.getByText('Halaman tidak ditemukan')).toBeVisible();
});
