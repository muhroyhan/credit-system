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

describe('AGREEMENT-U calendar and wording partitions', () => {
  it.each([
    ['2024-02-29', 12, '2025-02-28'],
    ['2026-12-31', 1, '2027-01-31'],
    ['2026-01-15', 0, '2026-01-15'],
    ['2026-01-31', 3, '2026-04-30'],
    ['2026-01-01', 1200, '2126-01-01'],
  ] as const)('adds %s by %s calendar months', (date, months, expected) => {
    expect(addAgreementMonths(date, months)).toBe(expected);
  });
  it.each([
    ['2026-01-01', 1201],
    ['2026-01-01', 0.5],
    ['2026-01-01', Infinity],
    ['9999-12-31', 1],
    ['2026-13-01', 1],
    ['', 1],
  ] as const)(
    'rejects date/month outside supported domain %s/%s',
    (date, months) => {
      expect(() => addAgreementMonths(date, months)).toThrow(RangeError);
    },
  );
  it.each([
    [1n, 'satu rupiah'],
    [12n, 'dua belas rupiah'],
    [20n, 'dua puluh rupiah'],
    [100n, 'seratus rupiah'],
    [200n, 'dua ratus rupiah'],
    [1000000000n, 'satu miliar rupiah'],
    [1000000000000n, 'satu triliun rupiah'],
  ] as const)(
    'spells %s without floating point conversion',
    (amount, expected) => {
      expect(rupiahInWords(amount)).toBe(expected);
    },
  );
  it('rejects wording overflow at one quadrillion', () => {
    expect(() => rupiahInWords(1000000000000000n)).toThrow(RangeError);
  });
});
