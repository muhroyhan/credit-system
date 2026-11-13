import { CreditStatusEnum } from '@credit/contracts';
import type { DashboardCreditTotals } from '@server/features/dashboard/dashboard.type';

export function dashboardCreditTotals(
  rows: Array<{ status: string | null; amount: string }>,
): DashboardCreditTotals {
  const totalCredits: DashboardCreditTotals = {
    pending: '0',
    approved: '0',
    completed: '0',
  };
  for (const row of rows) {
    if (
      row.status === CreditStatusEnum.Pending ||
      row.status === CreditStatusEnum.Approved ||
      row.status === CreditStatusEnum.Completed
    ) {
      totalCredits[row.status] = row.amount;
    }
  }
  return totalCredits;
}
