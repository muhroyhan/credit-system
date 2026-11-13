import { expect, test } from '@playwright/test';
import { loginBrowser, loginHeaders } from './fixtures/login';

test('company forms validate, reconcile arrays and display text detail', async ({
  page,
  request,
}) => {
  const name = `p04-ui-${Date.now()}`;
  await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
  await page.getByRole('link', { name: 'Perusahaan', exact: true }).click();
  await page.getByRole('link', { name: 'Tambah perusahaan' }).click();
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  await expect(page.getByLabel('Nama perusahaan')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByRole('textbox', { name: 'Badan usaha', exact: true }).click();
  await page.getByRole('option', { name: 'PT sintetis' }).click();
  await page.getByLabel('Nama perusahaan').fill(name);
  await page.getByLabel('Username perusahaan').fill(name);
  await page.getByLabel('Email perusahaan').fill(`${name}@example.invalid`);
  await page.getByLabel('Slug', { exact: true }).fill(name);
  await page.getByLabel('Password perusahaan').fill('Secret123');
  await page.getByRole('button', { name: 'Tambah bunga', exact: true }).click();
  await page.getByLabel('Bunga 1 (%)', { exact: true }).fill('0.75');
  await page.getByLabel('Tenor 1 (bulan)').fill('12');
  await page.getByRole('button', { name: 'Tambah biaya', exact: true }).click();
  await page.getByLabel('Nama biaya 1').fill('Administrasi');
  await page.getByLabel('Jenis biaya 1').fill('%');
  await page.getByLabel('Nilai biaya 1').fill('1');
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/user/create') && response.status() === 201,
  );
  await page.getByRole('button', { name: 'Simpan', exact: true }).click();
  const { id } = await (await created).json();
  try {
    const row = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name, exact: true }).first() });
    await expect(row).toBeVisible();
    await row.getByRole('link', { name: 'Lihat' }).click();
    await expect(page.getByText('12 bulan: 0.75%')).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
    await page.getByRole('link', { name: 'Kembali' }).click();
    await row.getByRole('link', { name: 'Ubah' }).click();
    await page.getByRole('button', { name: 'Hapus bunga 1' }).click();
    await page.getByRole('button', { name: 'Hapus biaya 1' }).click();
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await row.getByRole('link', { name: 'Lihat' }).click();
    await expect(page.getByText('12 bulan: 0.75%')).toHaveCount(0);
    await page.getByRole('link', { name: 'Kembali' }).click();
    page.once('dialog', (d) => d.accept());
    await row.getByRole('button', { name: 'Hapus', exact: true }).click();
    await expect(row).toHaveCount(0);
  } finally {
    const headers = await loginHeaders(request, {
      type: 'admin',
      username: 'admin_sintetis',
    });
    await request.put('/api/user/delete', { headers, data: { id } });
  }
});
