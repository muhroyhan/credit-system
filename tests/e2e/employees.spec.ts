import { employeeDocumentKinds } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import { creditExpense, credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { createDocumentStorage } from '@server/utils/document-storage';
import { employeeProfileFields } from '@web/features/employees/employees.constant';
import { eq } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test('nasabah registers, logs in, validates profile and uploads five distinct documents', async ({
  page,
  request,
}) => {
  const username = `p05-ui-${Date.now()}`;
  const company = await loginHeaders(request, {
    type: 'company',
    username: 'hrd_satu',
    slug: 'sintetis-satu',
  });
  let id: number | undefined;
  let creditId: number | undefined;
  await page.goto('/registration/sintetis-satu');
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await expect(page.getByLabel(/^Nama lengkap/)).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel(/^Nama lengkap/).fill('P05 UI');
  await page.getByLabel(/^Username/).fill(username);
  await page.getByLabel(/^Password/).fill('Secret123');
  await page.getByLabel(/^Konfirmasi password/).fill('Secret123');
  await page.getByRole('button', { name: 'Daftar', exact: true }).click();
  await expect(page).toHaveURL(/\/employees\/\d+\/edit$/);
  id = Number(new URL(page.url()).pathname.split('/')[2]);
  try {
    const profile = page.locator('form').filter({
      has: page.getByRole('heading', { name: 'Profil dan penghasilan' }),
    });
    await profile.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(profile.getByLabel(/^Nomor induk/)).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    for (const [key, label] of employeeProfileFields) {
      await profile
        .getByLabel(new RegExp(`^${label}`))
        .fill(key === 'tanggalLahir' ? '1992-03-04' : 'Synthetic');
    }
    await profile.getByLabel(/^Nomor HP/).fill('08123456789');
    await profile.getByLabel('Pendapatan bersih bulanan').fill('5000000');
    await profile.getByRole('button', { name: 'Simpan profil' }).click();
    await expect(
      page.getByText('Profil tersimpan', { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel(/^Nama lengkap/).first()).toHaveValue(
      'Synthetic',
    );
    await page.getByRole('button', { name: 'Simpan dokumen' }).click();
    await expect(page.getByText('Dokumen wajib diisi').first()).toBeVisible();
    for (let i = 0; i < 5; i++) {
      await page
        .locator('input[type=file]')
        .nth(i)
        .setInputFiles({
          name: 'synthetic.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(`%PDF-1.4 ${employeeDocumentKinds[i]}`),
        });
    }
    await page.getByRole('button', { name: 'Simpan dokumen' }).click();
    await expect(
      page.getByText('Dokumen tersimpan', { exact: true }),
    ).toBeVisible();
    const downloadEvent = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Unduh Slip gaji', exact: true })
      .click();
    expect((await downloadEvent).suggestedFilename()).toBe('slipGajiUrl.pdf');
    await page.getByRole('link', { name: 'Kembali', exact: true }).click();
    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', { name: 'Synthetic', exact: true }).first(),
    });
    await row.getByRole('link', { name: 'Lihat' }).click();
    await expect(
      page.getByText('Tanggal lahir: 1992-03-04', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Nomor HP: 08123456789', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
    const self = await loginHeaders(request, {
      type: 'debitor',
      username,
      slug: 'sintetis-satu',
      password: 'Secret123',
    });
    const created = await request.post('/api/credit/create', {
      headers: self,
      data: {
        debitorId: id,
        jumlahPengajuan: '12000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
      },
    });
    expect(created.status()).toBe(201);
    creditId = (await created.json()).id;
    expect(
      (
        await request.put('/api/credit/update', {
          headers: company,
          data: { id: creditId, status: 'approved' },
        })
      ).status(),
    ).toBe(200);
    const bank = await loginHeaders(request, {
      type: 'admin',
      username: 'admin_sintetis',
    });
    expect(
      (
        await request.put('/api/credit/review', {
          headers: bank,
          data: {
            id: creditId,
            jumlahPengajuan: '12000000',
            jangkaWaktuBulan: 12,
            biayaAsuransiJiwa: 100,
            statusAdminApproval: 'approved',
          },
        })
      ).status(),
    ).toBe(200);
    await page.getByRole('link', { name: 'Kembali', exact: true }).click();
    await page.getByRole('link', { name: 'Beranda', exact: true }).click();
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    await page.locator(`a[href="/credits/${creditId}"]`).first().click();
    await page.getByLabel('Bank', { exact: true }).fill('Bank Sintetis');
    await page.getByLabel('Cabang').fill('Cabang Sintetis');
    await page.getByLabel('Nama rekening').fill('Synthetic');
    await page.getByLabel('Nomor rekening').fill('123456');
    await page.getByLabel('Konfirmasi nama lengkap').fill('Synthetic');
    await page.getByLabel('Saya menyatakan data benar').check();
    await page.getByRole('button', { name: 'Simpan konfirmasi' }).click();
    await expect(
      page.getByRole('heading', { name: 'Terima kasih' }),
    ).toBeVisible();
    const pdfDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Unduh perjanjian' }).click();
    expect((await pdfDownload).suggestedFilename()).toBe(
      `agreement-${creditId}.pdf`,
    );
  } finally {
    if (creditId) {
      const db = connectDatabase().db;
      const [row] = await db
        .select({ key: credits.docStorageKey })
        .from(credits)
        .where(eq(credits.id, creditId));
      if (row?.key?.startsWith(`agreements/${creditId}/`)) {
        await createDocumentStorage().remove(row.key);
      }
      await db
        .delete(creditExpense)
        .where(eq(creditExpense.creditId, creditId));
      await db.delete(credits).where(eq(credits.id, creditId));
    }
    if (id) {
      await request.put('/api/debitor/delete', {
        headers: company,
        data: { id },
      });
    }
  }
});
test('HRD creates and deletes a scoped employee through standard pages', async ({
  page,
  request,
}) => {
  const username = `p05-hrd-${Date.now()}`;
  await loginBrowser(page, { type: 'company', username: 'hrd_satu' });
  await page.getByRole('link', { name: 'Master Karyawan' }).click();
  await page.getByRole('link', { name: 'Tambah karyawan' }).click();
  await page.getByLabel(/^Nama lengkap/).fill(username);
  await page.getByLabel('Username karyawan').fill('debitor_satu');
  await page.getByLabel('Password karyawan').fill('Secret123');
  await page.getByRole('button', { name: 'Simpan akun' }).click();
  await expect(
    page.getByText('Username sudah digunakan', { exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/employees\/add$/);
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/debitor/create') &&
      response.status() === 201,
  );
  await page.getByLabel('Username karyawan').fill(username);
  await page.getByRole('button', { name: 'Simpan akun' }).click();
  const { id } = await (await created).json();
  try {
    await page.getByLabel('Cari nama').fill(username);
    const row = page
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: new RegExp(username) }) });
    await expect(row).toBeVisible();
    await row.getByRole('link', { name: 'Ubah' }).click();
    await page
      .getByLabel(/^Nama lengkap/)
      .first()
      .fill(`${username}-edited`);
    await page.getByRole('button', { name: 'Simpan akun' }).click();
    await expect(
      page.getByText('Akun tersimpan', { exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Kembali', exact: true }).click();
    page.once('dialog', (d) => d.accept());
    await row.getByRole('button', { name: 'Hapus', exact: true }).click();
    await expect(row).toHaveCount(0);
  } finally {
    const headers = await loginHeaders(request, {
      type: 'company',
      username: 'hrd_satu',
      slug: 'sintetis-satu',
    });
    await request.put('/api/debitor/delete', { headers, data: { id } });
  }
});

test('employee pages reject direct anonymous URLs', async ({ page }) => {
  for (const path of [
    '/employees',
    '/employees/add',
    '/employees/900001',
    '/employees/900001/edit',
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
