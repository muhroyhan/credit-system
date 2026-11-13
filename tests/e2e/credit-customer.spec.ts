import { connectDatabase } from '@credit/database/client';
import { credits, debitors } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { eq, inArray } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test('customer confirms an approved credit and cancels another', async ({
  page,
  request,
}) => {
  const db = connectDatabase().db;
  const rows = await db
    .insert(credits)
    .values([
      {
        debitorId: 900001,
        status: 'approved',
        statusAdminApproval: 'approved',
        jumlahPengajuan: '12000000',
      },
      {
        debitorId: 900001,
        status: 'approved',
        statusAdminApproval: 'approved',
        jumlahPengajuan: '13000000',
      },
    ])
    .$returningId();
  const ids = rows.map((row) => row.id);
  try {
    const other = await loginHeaders(request, {
      type: 'debitor',
      username: 'debitor_dua',
      slug: 'sintetis-dua',
    });
    expect(
      (
        await request.get(`/api/credit/status?id=${ids[0]}`, { headers: other })
      ).status(),
    ).toBe(403);
    expect(
      (
        await request.put('/api/credit/cancel', {
          headers: other,
          data: { id: ids[0] },
        })
      ).status(),
    ).toBe(403);
    await loginBrowser(page, { type: 'debitor', username: 'debitor_satu' });
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    await page.locator(`a[href="/credits/${ids[0]}"]`).first().click();
    await expect(page.getByText('Rincian biaya')).toBeVisible();
    await page.getByRole('button', { name: 'Simpan konfirmasi' }).click();
    await expect(page.getByText('Bank wajib diisi')).toBeVisible();
    await page.getByLabel('Bank', { exact: true }).fill('Bank Test');
    await page.getByLabel('Cabang').fill('Jakarta');
    await page.getByLabel('Nama rekening').fill('Nama rekening');
    await page.getByLabel('Nomor rekening').fill('123456');
    await page.getByLabel('Konfirmasi nama lengkap').fill('nama salah');
    await page.getByLabel('Saya menyatakan data benar').check();
    await page.getByRole('button', { name: 'Simpan konfirmasi' }).click();
    await expect(
      page.getByText('Nama harus sama dengan nama debitor'),
    ).toBeVisible();
    const [debitor] = await db
      .select({ name: debitors.namaLengkap })
      .from(debitors)
      .where(eq(debitors.id, 900001));
    const customer = debitor?.name ?? '';
    await page.getByLabel('Konfirmasi nama lengkap').fill(customer);
    await page.getByRole('button', { name: 'Simpan konfirmasi' }).click();
    await expect(page.getByText(/Konfirmasi tersimpan pada/)).toBeVisible();
    await page.getByRole('link', { name: 'Kembali' }).click();
    await page.locator(`a[href="/credits/${ids[1]}"]`).first().click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Batalkan pengajuan' }).click();
    await expect(page.getByText(/Pembatalan tersimpan pada/)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Batalkan pengajuan' }),
    ).toHaveCount(0);
  } finally {
    await db.delete(credits).where(inArray(credits.id, ids));
  }
});
