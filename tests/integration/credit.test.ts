import { closeDatabase, connectDatabase } from '@credit/database/client';
import { creditCollection, credits } from '@credit/database/schema';
import type { Identity } from '@server/constant/interface';
import {
  CreditConflict,
  CreditForbidden,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { EmployeeConflict } from '@server/features/employees/employees.error';
import { employeesService } from '@server/features/employees/employees.service';
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
afterAll(async () => {
  if (url) {
    await closeDatabase();
  }
});
describe.skipIf(!url)('P06 credit transactions and tenant scope', () => {
  it('creates, updates child, guards deletion and locks approved applications', async () => {
    const input = {
      debitorId: 900001,
      jumlahPengajuan: '12.000.000',
      jangkaWaktuBulan: 12,
      tanggalPengajuan: '2026-11-13',
      collection: { namaMarketing: 'Synthetic' },
    };
    const db = connectDatabase().db;
    const id = await creditService.save(input, company);
    try {
      const detail = await creditService.detail(id, company);
      expect(detail.credit.status).toBe('pending');
      expect(detail.credit.jumlahAngsuran).toBe('1120000');
      expect(detail.children.collection?.namaMarketing).toBe('Synthetic');
      await expect(creditService.detail(id, other)).rejects.toBeInstanceOf(
        CreditForbidden,
      );
      await expect(
        employeesService.remove(900001, company),
      ).rejects.toBeInstanceOf(EmployeeConflict);
      await creditService.save(
        { ...input, collection: { namaMarketing: 'Updated' } },
        company,
        id,
      );
      expect(
        (await creditService.detail(id, company)).children.collection
          ?.namaMarketing,
      ).toBe('Updated');
      await expect(
        creditService.save(
          {
            ...input,
            jumlahPengajuan: '10000000',
            collection: { namaMarketing: 'x'.repeat(300) },
          },
          company,
          id,
        ),
      ).rejects.toThrow();
      expect(
        (await creditService.detail(id, company)).credit.jumlahPengajuan,
      ).toBe('12000000');
      await db
        .update(credits)
        .set({ status: 'approved' })
        .where(eq(credits.id, id));
      await expect(
        creditService.save(input, company, id),
      ).rejects.toBeInstanceOf(CreditConflict);
    } finally {
      await db
        .delete(creditCollection)
        .where(eq(creditCollection.creditId, id));
      await db.delete(credits).where(eq(credits.id, id));
    }
  });
});
