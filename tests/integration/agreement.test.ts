import { connectDatabase } from '@credit/database/client';
import { agreementSequences, credits } from '@credit/database/schema';
import type { Identity } from '@server/constant/interface';
import {
  AgreementConflict,
  AgreementForbidden,
} from '@server/features/agreement/agreement.error';
import {
  agreementService,
  createAgreementService,
} from '@server/features/agreement/agreement.service';
import { eq, inArray } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

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

describe('agreement numbering', () => {
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
  it('rolls back failed storage and reuses a real PDF on concurrent retries', async () => {
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
    const files = new Map<string, Uint8Array>();
    let fail = true;
    const service = createAgreementService({
      put: async (key, bytes) => {
        if (fail) {
          throw new Error('synthetic storage failure');
        }
        files.set(key, bytes);
      },
      get: async (key) => files.get(key) ?? null,
      remove: async (key) => {
        files.delete(key);
      },
    });
    try {
      await expect(service.generate(created.id, customer)).rejects.toThrow(
        'synthetic storage failure',
      );
      const [failed] = await db
        .select()
        .from(credits)
        .where(eq(credits.id, created.id));
      expect(failed?.docUrl).toBeNull();
      expect(failed?.agreementNumber).toBeNull();
      fail = false;
      const results = await Promise.all([
        service.generate(created.id, customer),
        service.generate(created.id, customer),
      ]);
      expect(results[0]).toEqual(results[1]);
      expect(files.size).toBe(1);
      const bytes = await service.download(created.id, customer);
      const content = new TextDecoder('latin1').decode(bytes);
      expect(content.startsWith('%PDF-')).toBe(true);
      expect(content).toContain('Pasal 8');
      expect(content).toContain('Surat persetujuan kredit');
      await expect(service.download(created.id, other)).rejects.toThrow();
    } finally {
      await db.delete(credits).where(eq(credits.id, created.id));
    }
  });
});
