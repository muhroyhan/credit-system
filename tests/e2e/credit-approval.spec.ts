import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { inArray } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

const password = process.env.SEED_PASSWORD;
test('HRD approves and rejects while other actors cannot decide', async ({
  page,
  request,
}) => {
  const ids: number[] = [];
  try {
    const signIn = async (
      type: 'admin' | 'company' | 'debitor',
      username: string,
      slug: string,
    ) => {
      return loginHeaders(request, { type, username, slug, password });
    };
    const hrd = await signIn('company', 'hrd_satu', 'sintetis-satu');
    const other = await signIn('company', 'hrd_dua', 'sintetis-dua');
    const debitor = await signIn('debitor', 'debitor_satu', 'sintetis-satu');
    const admin = await signIn('admin', 'admin_sintetis', 'admin');
    await loginBrowser(page, { type: 'company', username: 'hrd_satu' });
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    for (const [status, amount, button] of [
      ['approved', '15000000', 'Setujui'],
      ['rejected', '16000000', 'Tolak'],
    ] as const) {
      const created = await request.post('/api/credit/create', {
        headers: hrd,
        data: {
          debitorId: 900001,
          jumlahPengajuan: amount,
          jangkaWaktuBulan: 12,
          tanggalPengajuan: '2026-11-13',
        },
      });
      expect(created.status()).toBe(201);
      const { id } = await created.json();
      ids.push(id);
      for (const headers of [other, debitor, admin]) {
        expect(
          (
            await request.put('/api/credit/update', {
              headers,
              data: { id, status },
            })
          ).status(),
        ).toBe(403);
      }
      await page
        .getByLabel(/^Cari:/)
        .fill(
          status === 'approved' ? 'Debitor Sintetis Satu' : 'Debitor Sintetis',
        );
      const row = page.getByRole('row').filter({
        hasText: new Intl.NumberFormat('id-ID').format(Number(amount)),
      });
      await row.getByRole('link', { name: 'Lihat' }).click();
      page.once('dialog', (dialog) => dialog.accept());
      await page.getByRole('button', { name: button, exact: true }).click();
      await expect(page.getByText('Keputusan HRD tersimpan')).toBeVisible();
      await expect(
        page
          .getByRole('definition')
          .filter({ hasText: status === 'approved' ? 'Disetujui' : 'Ditolak' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(
        0,
      );
      await expect(page.getByRole('button', { name: 'Tolak' })).toHaveCount(0);
      expect(
        (
          await request.put('/api/credit/update', {
            headers: hrd,
            data: { id, status },
          })
        ).status(),
      ).toBe(409);
      await page.getByRole('link', { name: 'Kembali' }).click();
      await expect(
        page.getByRole('row').filter({
          hasText: new Intl.NumberFormat('id-ID').format(Number(amount)),
        }),
      ).toContainText(status === 'approved' ? 'Disetujui' : 'Ditolak');
    }
  } finally {
    if (ids.length) {
      await connectDatabase()
        .db.delete(credits)
        .where(inArray(credits.id, ids));
    }
  }
});
