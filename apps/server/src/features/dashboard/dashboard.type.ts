import type { Identity } from '@server/constant/interface';
export interface DashboardScope {
  type: Identity['type'];
  id: number;
  slug: string;
}
export interface DashboardCreditTotals {
  pending: string;
  approved: string;
  completed: string;
}
