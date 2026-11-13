import { CreditStatusEnum } from '@credit/contracts';
import type { Identity } from '@server/constant/interface';
import { dashboardRepository } from '@server/features/dashboard/dashboard.repository';
import type { DashboardCreditTotals } from '@server/features/dashboard/dashboard.type';

export const dashboardService = {
  async data(identity: Identity) {
    const result = await dashboardRepository.totals(identity);
    const totalCredits: DashboardCreditTotals = {
      pending: '0',
      approved: '0',
      completed: '0',
    };
    for (const row of result.rows) {
      if (
        row.status === CreditStatusEnum.Pending ||
        row.status === CreditStatusEnum.Approved ||
        row.status === CreditStatusEnum.Completed
      ) {
        totalCredits[row.status] = row.amount;
      }
    }
    return {
      totalUsers: result.totalUsers,
      totalDebitor: result.totalDebitor,
      totalCredits,
    };
  },
};
