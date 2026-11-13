import { closeDatabase, connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import type { Identity } from '@server/constant/interface';
import {
  CreditConflict,
  CreditForbidden,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = process.env.DATABASE_URL;
if (
  url &&
  (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname) ||
    !/^\/credit_[a-z0-9_]*test$/.test(new URL(url).pathname))
) {
  throw new Error('Isolated test database required');
}
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
const admin: Identity = {
  id: 900001,
  type: 'admin',
  slug: '',
  permissions: [{ program: 'CGP', value: 'APPROVAL' }],
};
const application = {
  debitorId: 900001,
  jumlahPengajuan: '12000000',
  jangkaWaktuBulan: 12,
  tanggalPengajuan: '2026-11-13',
};
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});
describe.skipIf(!url)('HRD approval and tenant scope', () => {
  for (const status of ['approved', 'rejected'] as const) {
    it(`applies and locks ${status} only for the owning HRD`, async () => {
      const db = connectDatabase().db;
      const id = await creditService.save(application, company);
      try {
        await expect(
          creditService.approve({ id, status }, other),
        ).rejects.toBeInstanceOf(CreditForbidden);
        await expect(
          creditService.approve({ id, status }, debitor),
        ).rejects.toBeInstanceOf(CreditForbidden);
        await expect(
          creditService.approve({ id, status }, admin),
        ).rejects.toBeInstanceOf(CreditForbidden);
        await creditService.approve({ id, status }, company);
        const [row] = await db.select().from(credits).where(eq(credits.id, id));
        expect(row?.status).toBe(status);
        expect(row?.updatedBy).toBe('company:900001');
        await expect(
          creditService.approve({ id, status }, company),
        ).rejects.toBeInstanceOf(CreditConflict);
        await expect(
          creditService.save(application, company, id),
        ).rejects.toBeInstanceOf(CreditConflict);
      } finally {
        await db.delete(credits).where(eq(credits.id, id));
      }
    });
  }
  it('serializes simultaneous competing decisions', async () => {
    const db = connectDatabase().db;
    const id = await creditService.save(application, company);
    try {
      const result = await Promise.allSettled([
        creditService.approve({ id, status: 'approved' }, company),
        creditService.approve({ id, status: 'rejected' }, company),
      ]);
      expect(result.filter((item) => item.status === 'fulfilled')).toHaveLength(
        1,
      );
      expect(result.filter((item) => item.status === 'rejected')).toHaveLength(
        1,
      );
    } finally {
      await db.delete(credits).where(eq(credits.id, id));
    }
  });
});
