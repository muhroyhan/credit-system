import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { createDocumentStorage } from '@server/utils/document-storage';
import { inArray } from 'drizzle-orm';
import { loginBrowser, loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test('CSV and ZIP respect filters and tenant access', async ({
  request,
  page,
}) => {
  const db = connectDatabase().db;
  const storage = createDocumentStorage();
  const rows = await db
    .insert(credits)
    .values([
      { debitorId: 900001, status: 'approved', jumlahPengajuan: '11111111' },
      { debitorId: 900002, status: 'approved', jumlahPengajuan: '22222222' },
    ])
    .$returningId();
  const ids = rows.map((row) => row.id);
  const first = ids[0];
  const second = ids[1];
  if (!first || !second) {
    throw new Error('Missing synthetic credits');
  }
  const keys = ids.map(
    (id) => `agreements/${id}/00000000-0000-4000-8000-000000000000.pdf`,
  );
  try {
    for (const [index, id] of ids.entries()) {
      const key = keys[index];
      if (!key) {
        throw new Error('Missing key');
      }
      await storage.put(
        key,
        new TextEncoder().encode(`%PDF-1.4 synthetic-${id}`),
      );
      await db
        .update(credits)
        .set({ docUrl: `/api/credit/doc?id=${id}`, docStorageKey: key })
        .where(inArray(credits.id, [id]));
    }
    const firstTenant = await loginHeaders(request, {
      type: 'company',
      username: 'hrd_satu',
      slug: 'sintetis-satu',
    });
    const secondTenant = await loginHeaders(request, {
      type: 'company',
      username: 'hrd_dua',
      slug: 'sintetis-dua',
    });
    const csv = await request.get(
      '/api/credit/export?format=csv&debitorId=900001&limit=1',
      { headers: firstTenant },
    );
    expect(csv.status()).toBe(200);
    expect(csv.headers()['content-type']).toContain('text/csv');
    expect(await csv.text()).toContain('11111111');
    expect(await csv.text()).not.toContain('22222222');
    const employeeCsv = await request.get(
      '/api/debitor/export?format=csv&namaLengkap=Debitor&limit=1',
      { headers: firstTenant },
    );
    expect(employeeCsv.status()).toBe(200);
    expect(await employeeCsv.text()).toContain('11111111');
    expect(await employeeCsv.text()).not.toContain('22222222');
    const zip = await request.get(
      '/api/credit/export-zip?debitorId=900001&limit=1',
      { headers: firstTenant },
    );
    expect(zip.status()).toBe(200);
    const content = (await zip.body()).toString('latin1');
    expect(content).toContain(`credit-${first}_`);
    expect(content).not.toContain(`credit-${second}_`);
    const other = await request.get('/api/credit/export-zip?debitorId=900001', {
      headers: secondTenant,
    });
    expect(other.status()).toBe(200);
    expect((await other.body()).length).toBe(22);
    await loginBrowser(page, { type: 'company', username: 'hrd_satu' });
    await page.getByRole('link', { name: 'Pengajuan Kredit' }).click();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export ZIP' }).click();
    expect((await download).suggestedFilename()).toBe('credit-documents.zip');
    await storage.remove(keys[0] ?? '');
    const missing = await request.get(
      '/api/credit/export-zip?debitorId=900001',
      { headers: firstTenant },
    );
    expect(missing.status()).toBe(404);
  } finally {
    for (const key of keys) {
      await storage.remove(key);
    }
    await db.delete(credits).where(inArray(credits.id, ids));
  }
});
