import {
  addAgreementMonths,
  rupiahInWords,
} from '@server/features/agreement/utils/agreement-format';
import { describe, expect, it } from 'vitest';

describe('agreement date and amount formatting', () => {
  it('adds calendar months with end-of-month and leap-year clamping', () => {
    expect(addAgreementMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addAgreementMonths('2023-01-31', 1)).toBe('2023-02-28');
    expect(addAgreementMonths('2023-11-30', 12)).toBe('2024-11-30');
    expect(() => addAgreementMonths('2023-02-30', 1)).toThrow();
    expect(() => addAgreementMonths('2024-01-01', -1)).toThrow();
  });
  it('spells whole rupiah without floating point rounding', () => {
    expect(rupiahInWords(0n)).toBe('nol rupiah');
    expect(rupiahInWords(11000n)).toBe('sebelas ribu rupiah');
    expect(rupiahInWords(1001n)).toBe('seribu satu rupiah');
    expect(rupiahInWords(12_000_000n)).toBe('dua belas juta rupiah');
    expect(rupiahInWords(101_200_345n)).toBe(
      'seratus satu juta dua ratus ribu tiga ratus empat puluh lima rupiah',
    );
    expect(() => rupiahInWords(-1n)).toThrow();
  });
});
