import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { createDocumentStorage } from '@server/utils/document-storage';
import { eq } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test.skip(
  !process.env.DATABASE_URL || !process.env.SEED_PASSWORD,
  'Synthetic DB required',
);
test('confirmed customer creates, revisits and downloads a private agreement', async ({
  page,
  request,
}) => {
  const db = connectDatabase().db;
  const [created] = await db
    .insert(credits)
    .values({
      debitorId: 900001,
      status: 'approved',
      statusAdminApproval: 'approved',
      debitorAcknowledgmentTimestamp: '2026-11-13',
      bankName: 'Bank',
      bankBranch: 'Cabang',
      bankAccountName: 'Nasabah',
      bankAccountNumber: '123',
      jumlahPengajuan: '12000000',
      jumlahAngsuran: '1120000',
      jangkaWaktuBulan: 12,
      bungaAngsuranBulanan: '1',
    })
    .$returningId();
  if (!created) {
    throw new Error('Missing credit');
  }
  try {
    const other = await loginHeaders(request, {
      type: 'debitor',
      username: 'debitor_dua',
      slug: 'sintetis-dua',
    });
    expect(
      (
        await request.post('/api/credit/doc/render', {
          headers: other,
          data: { id: created.id },
        })
      ).status(),
    ).toBe(403);
    await loginBrowser(page, { type: 'debitor', username: 'debitor_satu' });
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    await page.locator(`a[href="/credits/${created.id}"]`).first().click();
    await page.getByRole('button', { name: 'Buat dokumen' }).click();
    await expect(
      page.getByRole('heading', { name: 'Terima kasih' }),
    ).toBeVisible();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Unduh perjanjian' }).click();
    expect((await downloaded).suggestedFilename()).toBe(
      `agreement-${created.id}.pdf`,
    );
    expect(
      (
        await request.get(`/api/credit/doc?id=${created.id}`, {
          headers: other,
        })
      ).status(),
    ).toBe(403);
  } finally {
    const [stored] = await db
      .select({ key: credits.docStorageKey })
      .from(credits)
      .where(eq(credits.id, created.id));
    if (stored?.key?.startsWith(`agreements/${created.id}/`)) {
      await createDocumentStorage().remove(stored.key);
    }
    await db.delete(credits).where(eq(credits.id, created.id));
  }
});
