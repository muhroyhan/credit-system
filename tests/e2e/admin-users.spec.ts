import { expect, test } from '@playwright/test';
import { loginBrowser, loginHeaders } from './fixtures/login';

const password = process.env.SEED_PASSWORD;

test('ADMIN-E duplicate account shows a conflict and retains entered data', async ({
  page,
}) => {
  await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await page.getByRole('link', { name: 'Tambah administrator' }).click();
  await page.getByLabel('Username administrator').fill('admin_sintetis');
  await page
    .getByLabel('Email administrator')
    .fill('qa-conflict@example.invalid');
  await page.getByLabel('Password administrator').fill('Synthetic123');
  const conflict = page.waitForResponse((response) =>
    response.url().endsWith('/api/admin-user/create'),
  );
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  expect((await conflict).status()).toBe(409);
  await expect(page.getByRole('alert')).toContainText(
    'Username atau email sudah digunakan',
  );
  await expect(page.getByLabel('Username administrator')).toHaveValue(
    'admin_sintetis',
  );
  await expect(page).toHaveURL(/\/admin-users\/add$/);
});
test('admin interface adds and finds a user', async ({ page, request }) => {
  const username = `p03_ui_${Date.now()}`;
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_sintetis');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Admin User' })).toBeVisible();
  await page.getByRole('link', { name: 'Tambah administrator' }).click();
  await page.getByLabel('Username administrator').fill(username);
  await page
    .getByLabel('Email administrator')
    .fill(`${username}@example.invalid`);
  await page.getByLabel('Password administrator').fill('Secret123');
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/admin-user/create') &&
      response.status() === 201,
  );
  await page.getByRole('button', { name: 'Simpan' }).click();
  const { id } = await (await created).json();
  try {
    const row = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: username }) });
    await expect(row).toBeVisible();
    await row.getByRole('link', { name: 'Ubah' }).click();
    await expect(page).toHaveURL(/\/admin-users\/\d+\/edit$/);
    await page
      .getByLabel('Email administrator')
      .fill(`${username}_edit@example.invalid`);
    await page.getByRole('button', { name: 'Simpan' }).click();
    await expect(
      row.getByRole('cell', { name: `${username}_edit@example.invalid` }),
    ).toBeVisible();
    await row.getByRole('link', { name: 'Lihat' }).click();
    await expect(
      page
        .getByRole('definition')
        .filter({ hasText: `${username}_edit@example.invalid` }),
    ).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
    await page.getByRole('link', { name: 'Kembali' }).click();
    await page
      .getByRole('textbox', { name: 'Cari', exact: true })
      .fill(username);
    await expect(page.getByText('Total: 1', { exact: true })).toBeVisible();
    for (const format of ['PDF', 'XLSX']) {
      const downloaded = page.waitForEvent('download');
      await page.getByRole('button', { name: `Export ${format}` }).click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toBe(
        `admin-users.${format.toLowerCase()}`,
      );
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const bytes = Buffer.concat(chunks);
      expect(bytes.subarray(0, format === 'PDF' ? 4 : 2).toString()).toBe(
        format === 'PDF' ? '%PDF' : 'PK',
      );
    }
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Hapus' }).click();
    await expect(row).toHaveCount(0);
  } finally {
    const headers = await loginHeaders(request, {
      type: 'admin',
      username: 'admin_sintetis',
    });
    await request.put('/api/admin-user/delete', { headers, data: { id } });
  }
});

test('read-only admin can inspect but cannot edit', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username atau email').fill('admin_baca');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await page.getByRole('link', { name: 'Admin User', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Admin User' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tambah administrator' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ubah' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Lihat' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Detail administrator' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Simpan' })).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
  await page.evaluate(() => {
    history.pushState({}, '', '/admin-users/add');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('Akses ditolak')).toBeVisible();
  await expect(page.locator('input')).toHaveCount(0);
});

test('protected feature URLs redirect anonymous visitors to login', async ({
  page,
}) => {
  for (const path of [
    '/admin-users',
    '/admin-users/add',
    '/admin-users/900001/edit',
    '/admin-users/900001',
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole('button', { name: 'Masuk', exact: true }),
    ).toBeVisible();
  }
});
