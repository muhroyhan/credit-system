import { creditReviewSchema } from '@credit/contracts';
import { CreditInvalid } from '@server/features/credit/credit.error';
import { creditReviewService } from '@server/features/credit-review/credit-review.service';
import { describe, expect, it } from 'vitest';

describe('BPR expense calculations', () => {
  it('keeps fractional rupiah and the fixed stamp and savings rules', () => {
    const result = creditReviewService.calculateExpenses(
      10000001,
      1000001,
      125.5,
      [
        { expenseName: 'Provisi', unit: '%', value: 1 },
        { expenseName: 'Administrasi', unit: 'x', value: 2 },
        { expenseName: 'Tabungan wajib', unit: 'fixed', value: 5000 },
      ],
    );
    expect(result.expenses.map((item) => item.amount)).toEqual([
      '100000.01',
      '2000002.00',
      '5000.00',
    ]);
    expect(result.total).toBe('2110127.51');
    expect(result.received).toBe('7789873.49');
  });
});

describe('REVIEW-U snapshot and total boundaries', () => {
  it('retains fixed stamp and savings without configured expenses', () => {
    expect(
      creditReviewService.calculateExpenses(12000000, 1120000, 0, []),
    ).toEqual({ expenses: [], total: '10000.00', received: '11890000.00' });
  });
  it('excludes savings case-insensitively and retains negative net proceeds', () => {
    expect(
      creditReviewService.expenseTotals(100000, 0, [
        { expenseName: 'TABUNGAN wajib', amount: '999999.00' },
        { expenseName: 'Admin', amount: '1.01' },
      ]),
    ).toEqual({ total: '10001.01', received: '-10001.01' });
  });
  it.each([
    { expenseName: null, unit: '%', value: 1 },
    { expenseName: 'Admin', unit: null, value: 1 },
    { expenseName: 'Admin', unit: '%', value: null },
    { expenseName: 'Admin', unit: '%', value: -1 },
    { expenseName: 'Admin', unit: '%', value: 0.5 },
  ])('rejects incomplete configuration %j', (config) => {
    expect(() =>
      creditReviewService.calculateExpenses(12000000, 1120000, 0, [config]),
    ).toThrow(CreditInvalid);
  });
  it.each([-1, 0.001, NaN, Infinity])(
    'rejects invalid insurance %s',
    (insurance) => {
      expect(() =>
        creditReviewService.calculateExpenses(12000000, 1120000, insurance, []),
      ).toThrow(CreditInvalid);
    },
  );
  it.each(['1', '-1.00', 'NaN', '1.001'])(
    'rejects malformed snapshot %s',
    (amount) => {
      expect(() =>
        creditReviewService.expenseTotals(12000000, 0, [
          { expenseName: 'Admin', amount },
        ]),
      ).toThrow(CreditInvalid);
    },
  );
  it('rejects decimal storage overflow', () => {
    expect(() =>
      creditReviewService.calculateExpenses(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        0,
        [{ expenseName: 'Admin', unit: 'x', value: Number.MAX_SAFE_INTEGER }],
      ),
    ).toThrow(CreditInvalid);
  });
  it.each(['approved', 'rejected', 'completed'])(
    'accepts BPR %s input',
    (statusAdminApproval) => {
      expect(
        creditReviewSchema.safeParse({
          id: 1,
          statusAdminApproval,
          jumlahPengajuan: '12000000',
          jangkaWaktuBulan: 12,
          biayaAsuransiJiwa: 0,
        }).success,
      ).toBe(true);
    },
  );
});
