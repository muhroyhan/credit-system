import { closeDatabase, connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect, test } from '@playwright/test';
import { eq } from 'drizzle-orm';

const password = process.env.SEED_PASSWORD;
test.skip(
  !password || !process.env.DATABASE_URL,
  'Synthetic database required',
);

test('HRD simulates, submits, filters and edits a pending application', async ({
  page,
  request,
}) => {
  let id: number | undefined;
  try {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Jenis akun' }).click();
    await page.getByRole('option', { name: 'Perusahaan / HRD' }).click();
    await page.getByRole('textbox', { name: 'Perusahaan' }).click();
    await page
      .getByRole('option', { name: 'Perusahaan Sintetis Satu' })
      .click();
    await page.getByLabel('Username atau email').fill('hrd_satu');
    await page.getByLabel(/^Password/).fill(password ?? '');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    await page.getByRole('link', { name: 'Tambah pengajuan' }).click();
    await page.getByLabel('ID karyawan').fill('900001');
    await page.getByLabel('Nominal pengajuan').fill('12.000.000');
    await page.getByLabel('Tenor (bulan)').fill('12');
    await page.getByLabel('Tanggal pengajuan').fill('2026-11-13');
    await page.getByRole('button', { name: 'Hitung simulasi' }).click();
    await expect(page.getByText(/1\.120\.000/)).toBeVisible();
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/credit/create') &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Simpan pengajuan' }).click();
    const createResponse = await created;
    expect(createResponse.status()).toBe(201);
    id = (await createResponse.json()).id;
    await expect(page).toHaveURL(/\/credits$/);
    await page
      .getByLabel('Nama', { exact: true })
      .fill('Debitor Sintetis Satu');
    const row = page
      .getByRole('row')
      .filter({ hasText: 'Debitor Sintetis Satu' })
      .first();
    await expect(row).toContainText('pending');
    const href = await row
      .getByRole('link', { name: 'Ubah' })
      .getAttribute('href');
    expect(Number(href?.match(/\/credits\/(\d+)\/edit/)?.[1])).toBe(id);
    expect(id).toBeGreaterThan(0);
    const otherLogin = await request.post('/api/login', {
      data: {
        type: 'company',
        username: 'hrd_dua',
        slug: 'sintetis-dua',
        password,
      },
    });
    expect(otherLogin.status()).toBe(200);
    const otherHeaders = {
      Authorization: `Bearer ${(await otherLogin.json()).authToken}`,
    };
    expect(
      (
        await request.get(`/api/credit/detail?id=${id}`, {
          headers: otherHeaders,
        })
      ).status(),
    ).toBe(403);
    const rejected = await request.post('/api/credit/create', {
      headers: otherHeaders,
      data: {
        debitorId: 900002,
        jumlahPengajuan: '12000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
        status: 'approved',
      },
    });
    expect(rejected.status()).toBe(400);
    await row.getByRole('link', { name: 'Ubah' }).click();
    await page.getByLabel('Nominal pengajuan').fill('10000000');
    await page.getByRole('button', { name: 'Simpan pengajuan' }).click();
    await expect(page).toHaveURL(/\/credits$/);
    await expect(
      page.getByRole('row').filter({ hasText: '10000000' }).first(),
    ).toBeVisible();
  } finally {
    if (id) {
      await connectDatabase().db.delete(credits).where(eq(credits.id, id));
    }
    await closeDatabase();
  }
});
