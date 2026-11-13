import { closeDatabase, connectDatabase } from '@credit/database/client';
import { agreementSequences, credits } from '@credit/database/schema';
import { testDatabaseUrl } from '@credit/test-utils/database';
import type { Identity } from '@server/constant/interface';
import {
  AgreementConflict,
  AgreementForbidden,
} from '@server/features/agreement/agreement.error';
import { agreementService } from '@server/features/agreement/agreement.service';
import { eq, inArray } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';

const url = testDatabaseUrl(process.env.DATABASE_URL);
const customer: Identity = {
  id: 900001,
  type: 'debitor',
  slug: 'sintetis-satu',
  permissions: [],
};
const other: Identity = {
  id: 900002,
  type: 'debitor',
  slug: 'sintetis-dua',
  permissions: [],
};
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});

describe.skipIf(!url)('agreement numbering', () => {
  it('locks monthly numbers across credits and preserves numbers on retry', async () => {
    const db = connectDatabase().db;
    const month = '2003-02';
    const rows = await db
      .insert(credits)
      .values(
        [1, 2].map(() => ({
          debitorId: 900001,
          status: 'approved',
          statusAdminApproval: 'approved',
          debitorAcknowledgmentTimestamp: '2003-02-12',
          bankName: 'Bank',
          bankBranch: 'Cabang',
          bankAccountName: 'Nasabah',
          bankAccountNumber: '123',
          createdAt: new Date('2003-02-12T10:00:00Z'),
        })),
      )
      .$returningId();
    const ids = rows.map((row) => row.id);
    const first = ids[0];
    const second = ids[1];
    if (first === undefined || second === undefined) {
      throw new Error('Missing synthetic credits');
    }
    try {
      await expect(
        agreementService.allocateNumber(first, other),
      ).rejects.toBeInstanceOf(AgreementForbidden);
      const numbers = await Promise.all([
        agreementService.allocateNumber(first, customer),
        agreementService.allocateNumber(second, customer),
      ]);
      expect(new Set(numbers).size).toBe(2);
      expect(numbers.every((number) => number.endsWith('/02/2003'))).toBe(true);
      expect(await agreementService.allocateNumber(first, customer)).toBe(
        numbers[0],
      );
      await db
        .update(credits)
        .set({ statusAdminApproval: 'rejected' })
        .where(eq(credits.id, second));
      await expect(
        agreementService.allocateNumber(second, customer),
      ).rejects.toBeInstanceOf(AgreementConflict);
    } finally {
      await db.delete(credits).where(inArray(credits.id, ids));
      await db
        .delete(agreementSequences)
        .where(eq(agreementSequences.month, month));
    }
  });
});
