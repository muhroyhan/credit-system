import { formatMoney } from '@web/utils/format-money';
import { describe, expect, it } from 'vitest';

describe('financial display', () => {
  it('preserves large decimal strings without numeric conversion', () => {
    expect(formatMoney('12345678901234567890.05')).toBe(
      'Rp 12.345.678.901.234.567.890,05',
    );
    expect(formatMoney('-1234.50')).toBe('Rp -1.234,50');
    expect(formatMoney('0')).toBe('Rp 0');
  });
  it('distinguishes absent and unrecognized values from zero', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney('')).toBe('—');
    expect(formatMoney('1e6')).toBe('1e6');
  });
});
