import { creditApplicationSchema } from '@credit/contracts';
import { CreditInvalid } from '@server/features/credit/credit.error';
import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';

const rates = [
  { jangkaWaktuBulan: '12', bungaPercentage: '1' },
  { jangkaWaktuBulan: '24', bungaPercentage: '1' },
];

describe('credit simulation', () => {
  it('calculates the independently specified flat interest example', () => {
    expect(creditService.simulate('12.000.000', 12, rates)).toMatchObject({
      principal: 12000000,
      installment: 1120000,
      total: 13440000,
    });
    expect(creditService.summary(6000000, ['1000000', '2.000.000'])).toEqual({
      open: 3000000,
      score: 3000000,
    });
  });
  it('checks boundaries, zero and unavailable tenor', () => {
    expect(() => creditService.simulate('7999999', 24, rates)).toThrow(
      CreditInvalid,
    );
    expect(creditService.simulate('8000000', 24, rates).months).toBe(24);
    expect(() => creditService.simulate('8000000', 0, rates)).toThrow(
      CreditInvalid,
    );
    expect(() => creditService.simulate('8000000', 36, rates)).toThrow(
      CreditInvalid,
    );
    expect(() => creditService.simulate('0', 12, rates)).toThrow(CreditInvalid);
    expect(() => creditService.simulate('12.34', 12, rates)).toThrow(
      CreditInvalid,
    );
  });
  it('rejects approval and cost fields from the applicant', () => {
    expect(
      creditApplicationSchema.safeParse({
        debitorId: 1,
        jumlahPengajuan: '10000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
        status: 'approved',
      }).success,
    ).toBe(false);
    expect(
      creditApplicationSchema.safeParse({
        debitorId: 1,
        jumlahPengajuan: '10000000',
        jangkaWaktuBulan: 12,
        tanggalPengajuan: '2026-11-13',
        biayaAsuransiJiwa: 1,
      }).success,
    ).toBe(false);
  });
});
