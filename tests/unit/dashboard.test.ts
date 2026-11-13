import { dashboardCreditTotals } from '@server/features/dashboard/dashboard.service';
import { expect, it } from 'vitest';

it('fills missing statuses with zero and preserves precise nominal sums', () => {
  expect(
    dashboardCreditTotals([
      { status: 'pending', amount: '12345678901234567890' },
      { status: 'rejected', amount: '50' },
      { status: null, amount: '9' },
    ]),
  ).toEqual({ pending: '12345678901234567890', approved: '0', completed: '0' });
});
