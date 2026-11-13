import type { Identity } from '@server/constant/interface';
import { dashboardRepository } from '@server/features/dashboard/dashboard.repository';
import { dashboardCreditTotals } from '@server/features/dashboard/utils/dashboard-credit-totals';

export const dashboardService = {
  async data(identity: Identity) {
    const result = await dashboardRepository.totals(identity);
    const totalCredits = dashboardCreditTotals(result.rows);
    return {
      totalUsers: result.totalUsers,
      totalDebitor: result.totalDebitor,
      totalCredits,
    };
  },
};
