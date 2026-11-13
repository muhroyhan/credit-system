import { connectDatabase } from '@credit/database/client';
import { credits } from '@credit/database/schema';
import type { Identity } from '@server/constant/interface';
import {
  CreditConflict,
  CreditForbidden,
  CreditInvalid,
} from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

const company: Identity = {
  id: 900001,
  type: 'company',
  slug: 'sintetis-satu',
  permissions: [],
};
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
describe('customer credit confirmation', () => {
  it('requires ownership, approvals and exact name, and prevents repeated writes', async () => {
    const db = connectDatabase().db;
    const id = await creditService.save(
      {
        debitorId: 900001,
        jumlahPengajuan: '12000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
      },
      company,
    );
    const input = {
      id,
      bankName: 'Bank',
      bankBranch: 'Cabang',
      bankAccountName: 'Pemilik',
      bankAccountNumber: '1234',
      confirmationName: 'wrong',
      confirmed: true as const,
    };
    try {
      await expect(
        creditService.confirm(input, customer),
      ).rejects.toBeInstanceOf(CreditConflict);
      await expect(creditService.cancel(id, other)).rejects.toBeInstanceOf(
        CreditForbidden,
      );
      await db
        .update(credits)
        .set({ status: 'approved', statusAdminApproval: 'approved' })
        .where(eq(credits.id, id));
      await expect(
        creditService.confirm(input, customer),
      ).rejects.toBeInstanceOf(CreditInvalid);
      const detail = await creditService.status(id, customer);
      expect(detail.nama).toBeTruthy();
      await creditService.confirm(
        { ...input, confirmationName: detail.nama ?? '' },
        customer,
      );
      const [saved] = await db.select().from(credits).where(eq(credits.id, id));
      expect(saved?.bankAccountNumber).toBe('1234');
      expect(saved?.debitorAcknowledgmentTimestamp).toBeTruthy();
      await expect(
        creditService.confirm(
          { ...input, confirmationName: detail.nama ?? '' },
          customer,
        ),
      ).rejects.toBeInstanceOf(CreditConflict);
      await expect(creditService.cancel(id, customer)).rejects.toBeInstanceOf(
        CreditConflict,
      );
    } finally {
      await db.delete(credits).where(eq(credits.id, id));
    }
  });
  it('cancels without changing HRD approval', async () => {
    const db = connectDatabase().db;
    const id = await creditService.save(
      {
        debitorId: 900001,
        jumlahPengajuan: '12000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
      },
      company,
    );
    try {
      await db
        .update(credits)
        .set({ status: 'approved', statusAdminApproval: 'approved' })
        .where(eq(credits.id, id));
      await creditService.cancel(id, customer);
      const [saved] = await db.select().from(credits).where(eq(credits.id, id));
      expect(saved).toMatchObject({
        status: 'approved',
        statusAdminApproval: 'rejected',
      });
      expect(saved?.debitorAcknowledgmentTimestamp).toBeTruthy();
      await expect(creditService.cancel(id, customer)).rejects.toBeInstanceOf(
        CreditConflict,
      );
    } finally {
      await db.delete(credits).where(eq(credits.id, id));
    }
  });
});
