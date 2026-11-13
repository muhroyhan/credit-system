import { creditService } from '@server/features/credit/credit.service';
import { describe, expect, it } from 'vitest';

describe('BPR expense calculations', () => {
  it('keeps fractional rupiah and the fixed stamp and savings rules', () => {
    const result = creditService.calculateExpenses(10000001, 1000001, 125.5, [
      { expenseName: 'Provisi', unit: '%', value: 1 },
      { expenseName: 'Administrasi', unit: 'x', value: 2 },
      { expenseName: 'Tabungan wajib', unit: 'fixed', value: 5000 },
    ]);
    expect(result.expenses.map((item) => item.amount)).toEqual([
      '100000.01',
      '2000002.00',
      '5000.00',
    ]);
    expect(result.total).toBe('2110127.51');
    expect(result.received).toBe('7789873.49');
  });
});
