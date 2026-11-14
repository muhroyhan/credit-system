import { connectDatabase } from '@credit/database/client';
import { credits, debitors } from '@credit/database/schema';
import { expect } from '@playwright/test';
import { creditListSchema } from '@web/features/credit/credit.type';
import { eq, inArray } from 'drizzle-orm';
import { loginHeaders } from './fixtures/login';
import { test } from './fixtures/test';

test('search matches alternate columns, preserves tenant scope and exports', async ({
  request,
}) => {
  const db = connectDatabase().db;
  const [employee] = await db
    .select({ alias: debitors.namaAlias })
    .from(debitors)
    .where(eq(debitors.id, 900001));
  if (!employee) {
    throw new Error('Missing synthetic employee');
  }
  const rows = await db
    .insert(credits)
    .values([
      { debitorId: 900001, status: 'approved', jumlahPengajuan: '11111111' },
      { debitorId: 900002, status: 'approved', jumlahPengajuan: '22222222' },
    ])
    .$returningId();
  try {
    await db
      .update(debitors)
      .set({ namaAlias: 'alias-unique-search' })
      .where(eq(debitors.id, 900001));
    const admin = await loginHeaders(request, {
      type: 'admin',
      username: 'admin_sintetis',
    });
    const hrd = await loginHeaders(request, {
      type: 'company',
      username: 'hrd_satu',
      slug: 'sintetis-satu',
    });
    for (const [endpoint, term] of [
      ['/api/admin-user/list', 'admin-baca@example.invalid'],
      ['/api/user/list', 'hrd1@example.invalid'],
      ['/api/debitor/list', 'alias-unique-search'],
    ] as const) {
      const result = await request.get(
        `${endpoint}?search=${encodeURIComponent(term)}`,
        { headers: admin },
      );
      expect(result.status()).toBe(200);
      expect((await result.json()).count).toBe(1);
    }
    for (const endpoint of ['/api/credit/list', '/api/credit/review/list']) {
      const result = await request.get(
        `${endpoint}?search=Perusahaan%20Sintetis%20Satu&status=approved`,
        { headers: admin },
      );
      expect(result.status()).toBe(200);
      expect((await result.json()).count).toBe(1);
    }
    for (const key of ['companyName', 'jumlahPengajuan'] as const) {
      for (const direction of ['asc', 'desc'] as const) {
        const response = await request.get(
          `/api/credit/list?search=Perusahaan%20Sintetis&sortBy=${key}&sortDirection=${direction}`,
          { headers: admin },
        );
        expect(response.status()).toBe(200);
        const data = creditListSchema.parse(await response.json()).data;
        const first = data.findIndex((row) => row.credit.id === rows[0]?.id);
        const second = data.findIndex((row) => row.credit.id === rows[1]?.id);
        expect(first).toBeGreaterThanOrEqual(0);
        expect(second).toBeGreaterThanOrEqual(0);
        const firstBeforeSecond =
          key === 'jumlahPengajuan'
            ? direction === 'asc'
            : direction === 'desc';
        expect(firstBeforeSecond ? first < second : second < first).toBe(true);
      }
    }
    const scoped = await request.get(
      '/api/credit/list?search=Perusahaan%20Sintetis%20Dua',
      { headers: hrd },
    );
    expect((await scoped.json()).count).toBe(0);
    const exported = await request.get(
      '/api/credit/export?format=csv&search=Perusahaan%20Sintetis%20Satu',
      { headers: hrd },
    );
    expect(exported.status()).toBe(200);
    expect(await exported.text()).toContain('11111111');
    expect(await exported.text()).not.toContain('22222222');
    expect(
      (
        await request.get(`/api/user/list?search=${'x'.repeat(256)}`, {
          headers: admin,
        })
      ).status(),
    ).toBe(400);
  } finally {
    await db
      .update(debitors)
      .set({ namaAlias: employee.alias })
      .where(eq(debitors.id, 900001));
    await db.delete(credits).where(
      inArray(
        credits.id,
        rows.map((row) => row.id),
      ),
    );
  }
});
