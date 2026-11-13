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

describe('CREDIT-U amount partitions and arithmetic', () => {
  it.each(['12000000', '12.000.000', ' 12.000.000 '])(
    'normalizes equivalent nominal %s',
    (amount) => {
      expect(creditService.parseAmount(amount)).toBe(12000000);
    },
  );
  it.each([
    '',
    '0',
    '-1',
    '1.5',
    '12,000,000',
    '1e6',
    'NaN',
    'Infinity',
    '12.34',
    '1..000',
    '9007199254740992',
  ])('rejects invalid nominal %s', (amount) => {
    expect(() => creditService.parseAmount(amount)).toThrow(CreditInvalid);
  });
  it.each([0, -1, 1.5, NaN, Infinity])(
    'rejects invalid months %s',
    (months) => {
      expect(() => creditService.simulate('12000000', months, rates)).toThrow(
        CreditInvalid,
      );
    },
  );
  it('calculates zero and fractional monthly rates independently', () => {
    expect(
      creditService.simulate('10000001', 12, [
        { jangkaWaktuBulan: '12', bungaPercentage: '0' },
      ]),
    ).toMatchObject({ installment: 833333, total: 9999996 });
    expect(
      creditService.simulate('12000000', 12, [
        { jangkaWaktuBulan: '12', bungaPercentage: '0.75' },
      ]),
    ).toMatchObject({ installment: 1090000, total: 13080000 });
  });
  it.each(['-1', 'NaN', 'Infinity', '1e2', ''])(
    'rejects unusable rate %s',
    (rate) => {
      expect(() =>
        creditService.simulate('12000000', 12, [
          { jangkaWaktuBulan: '12', bungaPercentage: rate },
        ]),
      ).toThrow(CreditInvalid);
    },
  );
  it('rejects missing configuration and unsafe arithmetic', () => {
    expect(() => creditService.simulate('1000000', 12, [])).toThrow(
      CreditInvalid,
    );
    expect(() => creditService.simulate('9007199254740991', 12, rates)).toThrow(
      CreditInvalid,
    );
    expect(() => creditService.summary(0, ['9007199254740991', '1'])).toThrow(
      CreditInvalid,
    );
  });
  it('keeps score informational, including zero and negative values', () => {
    expect(creditService.summary(0, [])).toEqual({ open: 0, score: 0 });
    expect(creditService.summary(1000000, ['2000000'])).toEqual({
      open: 2000000,
      score: -1000000,
    });
  });
  it.each([-1, 0.5, NaN, Infinity])('rejects invalid income %s', (income) => {
    expect(() => creditService.summary(income, [])).toThrow(CreditInvalid);
  });
});
