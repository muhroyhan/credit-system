import { closeDatabase, connectDatabase } from '@credit/database/client';
import { credits, users } from '@credit/database/schema';
import { testDatabaseUrl } from '@credit/test-utils/database';
import type { Identity } from '@server/constant/interface';
import { dashboardService } from '@server/features/dashboard/dashboard.service';
import { inArray } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = testDatabaseUrl(process.env.DATABASE_URL);
const admin: Identity = {
  id: 900001,
  type: 'admin',
  slug: 'admin',
  permissions: [],
};
const company: Identity = {
  id: 900001,
  type: 'company',
  slug: 'sintetis-satu',
  permissions: [],
};
const other: Identity = {
  id: 900002,
  type: 'company',
  slug: 'sintetis-dua',
  permissions: [],
};
const debitor: Identity = {
  id: 900001,
  type: 'debitor',
  slug: 'sintetis-satu',
  permissions: [],
};
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});
describe.skipIf(!url)('dashboard aggregates', () => {
  it('applies actor scopes and HRD status to exact nominal totals', async () => {
    const db = connectDatabase().db;
    const before = await Promise.all([
      dashboardService.data(admin),
      dashboardService.data(company),
      dashboardService.data(other),
      dashboardService.data(debitor),
    ]);
    const companies = await db
      .insert(users)
      .values([
        { companyName: 'P12 active', status: 'active' },
        { companyName: 'P12 inactive', status: 'inactive' },
        { companyName: 'P12 blocked', status: 'blocked' },
      ])
      .$returningId();
    const rows = await db
      .insert(credits)
      .values([
        {
          debitorId: 900001,
          status: 'pending',
          jumlahPengajuan: '123456789012345',
        },
        {
          debitorId: 900001,
          status: 'approved',
          statusAdminApproval: 'rejected',
          jumlahPengajuan: '11',
        },
        { debitorId: 900001, status: 'completed', jumlahPengajuan: '13' },
        { debitorId: 900001, status: 'rejected', jumlahPengajuan: '19' },
        { debitorId: 900002, status: 'pending', jumlahPengajuan: '23' },
      ])
      .$returningId();
    try {
      const after = await Promise.all([
        dashboardService.data(admin),
        dashboardService.data(company),
        dashboardService.data(other),
        dashboardService.data(debitor),
      ]);
      const delta = (i: number, key: 'pending' | 'approved' | 'completed') =>
        BigInt(after[i]?.totalCredits[key] ?? '0') -
        BigInt(before[i]?.totalCredits[key] ?? '0');
      expect(delta(0, 'pending')).toBe(123456789012368n);
      expect(delta(1, 'pending')).toBe(123456789012345n);
      expect(delta(2, 'pending')).toBe(23n);
      expect(delta(3, 'pending')).toBe(123456789012345n);
      expect(delta(3, 'approved')).toBe(11n);
      expect(delta(3, 'completed')).toBe(13n);
      expect(after[0]?.totalUsers).toBe((before[0]?.totalUsers ?? 0) + 2);
      expect(after[3]?.totalDebitor).toBe(0);
      expect(after[1]?.totalUsers).toBe(after[3]?.totalUsers);
    } finally {
      await db.delete(users).where(
        inArray(
          users.id,
          companies.map((row) => row.id),
        ),
      );
      await db.delete(credits).where(
        inArray(
          credits.id,
          rows.map((row) => row.id),
        ),
      );
    }
  });
});
