import { closeDatabase, connectDatabase } from '@credit/database/client';
import { creditExpense, credits } from '@credit/database/schema';
import { testDatabaseUrl } from '@credit/test-utils/database';
import type { Identity } from '@server/constant/interface';
import {
  CreditConflict,
  CreditForbidden,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = testDatabaseUrl(process.env.DATABASE_URL);
const company: Identity = {
  id: 900001,
  type: 'company',
  slug: 'sintetis-satu',
  permissions: [],
};
const admin: Identity = {
  id: 900001,
  type: 'admin',
  slug: '',
  permissions: [
    { program: 'DKN', value: 'APPROVAL' },
    { program: 'DKN', value: 'READ' },
    { program: 'DKN', value: 'UPDATE' },
  ],
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
describe.skipIf(!url)('BPR review', () => {
  for (const status of ['approved', 'rejected', 'completed'] as const) {
    it(`saves ${status} and enforces actor and repeat rules`, async () => {
      const db = connectDatabase().db;
      const id = await creditService.save(application, company);
      try {
        await creditService.approve({ id, status: 'approved' }, company);
        const input = {
          id,
          statusAdminApproval: status,
          jumlahPengajuan: '12000000',
          jangkaWaktuBulan: 12,
          biayaAsuransiJiwa: 100,
        };
        await expect(
          creditReviewService.review(input, company),
        ).rejects.toBeInstanceOf(CreditForbidden);
        const result = await creditReviewService.review(input, admin);
        expect(result.id).toBe(id);
        const [row] = await db.select().from(credits).where(eq(credits.id, id));
        expect(row?.statusAdminApproval).toBe(status);
        if (status === 'rejected') {
          expect(row?.status).toBe('rejected');
        }
        if (status === 'approved') {
          expect(
            (
              await db
                .select()
                .from(creditExpense)
                .where(eq(creditExpense.creditId, id))
            ).length,
          ).toBeGreaterThan(0);
        }
        await expect(
          creditReviewService.review(input, admin),
        ).rejects.toBeInstanceOf(CreditConflict);
      } finally {
        await db.delete(creditExpense).where(eq(creditExpense.creditId, id));
        await db.delete(credits).where(eq(credits.id, id));
      }
    });
  }
});
