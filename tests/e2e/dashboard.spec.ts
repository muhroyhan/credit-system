import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { inArray } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test.skip(
  !process.env.DATABASE_URL || !process.env.SEED_PASSWORD,
  'Synthetic database required',
);
test('dashboard shows scoped totals and rejects anonymous requests', async ({
  page,
  request,
}) => {
  const db = connectDatabase().db;
  const rows = await db
    .insert(credits)
    .values([
      { debitorId: 900001, status: 'pending', jumlahPengajuan: '12345001' },
      { debitorId: 900002, status: 'pending', jumlahPengajuan: '99999999' },
    ])
    .$returningId();
  try {
    expect((await request.get('/api/dashboard/data')).status()).toBe(401);
    const headers = await loginHeaders(request, {
      type: 'company',
      username: 'hrd_satu',
      slug: 'sintetis-satu',
    });
    const response = await request.get('/api/dashboard/data', { headers });
    expect(response.status()).toBe(200);
    const summary = await response.json();
    expect(summary.totalCredits.pending).toBe('12345001');
    await loginBrowser(page, { type: 'company', username: 'hrd_satu' });
    await expect(
      page.getByText('Pengajuan pending: Rp 12.345.001'),
    ).toBeVisible();
    await expect(page.getByText(/99.999.999/)).toHaveCount(0);
  } finally {
    await db.delete(credits).where(
      inArray(
        credits.id,
        rows.map((row) => row.id),
      ),
    );
  }
});
