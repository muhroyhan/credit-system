import { connectDatabase } from '@credit/database/client';
import { creditExpense, credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { inArray } from 'drizzle-orm';
import { loginBrowser } from './fixtures/login';
import { test } from './fixtures/test';

const password = process.env.SEED_PASSWORD;
test.skip(
  !password || !process.env.DATABASE_URL,
  'Synthetic database required',
);
test('BPR can approve, reject and complete HRD-approved applications', async ({
  page,
  request,
}) => {
  const ids: number[] = [];
  try {
    const login = await request.post('/api/login', {
      data: {
        type: 'company',
        username: 'hrd_satu',
        slug: 'sintetis-satu',
        password,
      },
    });
    expect(login.status()).toBe(200);
    const headers = {
      Authorization: `Bearer ${(await login.json()).authToken}`,
    };
    for (const amount of ['17000000', '18000000', '19000000']) {
      const response = await request.post('/api/credit/create', {
        headers,
        data: {
          debitorId: 900001,
          jumlahPengajuan: amount,
          jangkaWaktuBulan: 12,
          tanggalPengajuan: '2026-11-13',
        },
      });
      expect(response.status()).toBe(201);
      const { id } = await response.json();
      ids.push(id);
      expect(
        (
          await request.put('/api/credit/update', {
            headers,
            data: { id, status: 'approved' },
          })
        ).status(),
      ).toBe(200);
    }
    await loginBrowser(page, { type: 'admin', username: 'admin_sintetis' });
    await page.getByRole('link', { name: 'Daftar Kredit Karyawan' }).click();
    for (const [index, [amount, status]] of [
      ['17000000', 'approved'],
      ['18000000', 'rejected'],
      ['19000000', 'completed'],
    ].entries()) {
      await page
        .getByRole('row')
        .filter({
          has: page.locator(`a[href="/credit-reviews/${ids[index]}"]`),
        })
        .filter({ hasText: amount })
        .getByRole('link', { name: 'Lihat' })
        .click();
      await page.getByRole('link', { name: 'Ubah keputusan' }).click();
      await page.getByRole('textbox', { name: 'Keputusan BPR' }).click();
      await page.getByRole('option', { name: status, exact: true }).click();
      await page.getByRole('button', { name: 'Simpan keputusan' }).click();
      await expect(page.getByText(/Keputusan tersimpan/).first()).toBeVisible();
      if (status !== 'approved') {
        await expect(
          page.getByRole('button', { name: 'Simpan keputusan' }),
        ).toHaveCount(0);
      }
      await page.getByRole('link', { name: 'Kembali' }).click();
      await expect(page.getByText(`Status BPR: ${status}`)).toBeVisible();
      await page.getByRole('link', { name: 'Kembali' }).click();
    }
  } finally {
    if (ids.length) {
      const db = connectDatabase().db;
      await db
        .delete(creditExpense)
        .where(inArray(creditExpense.creditId, ids));
      await db.delete(credits).where(inArray(credits.id, ids));
    }
  }
});
