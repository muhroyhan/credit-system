import { dashboardCreditTotals } from '@server/features/dashboard/utils/dashboard-credit-totals';
import { describe, expect, it } from 'vitest';

it('fills missing statuses with zero and preserves precise nominal sums', () => {
  expect(
    dashboardCreditTotals([
      { status: 'pending', amount: '12345678901234567890' },
      { status: 'rejected', amount: '50' },
      { status: null, amount: '9' },
    ]),
  ).toEqual({ pending: '12345678901234567890', approved: '0', completed: '0' });
});

describe('DASHBOARD-U status mapping', () => {
  it('returns zero totals for an empty dataset', () => {
    expect(dashboardCreditTotals([])).toEqual({
      pending: '0',
      approved: '0',
      completed: '0',
    });
  });
  it('maps each HRD status and ignores unsupported/null rows', () => {
    expect(
      dashboardCreditTotals([
        { status: 'pending', amount: '11' },
        { status: 'approved', amount: '13' },
        { status: 'completed', amount: '17' },
        { status: 'rejected', amount: '19' },
        { status: null, amount: '23' },
      ]),
    ).toEqual({ pending: '11', approved: '13', completed: '17' });
  });
});
