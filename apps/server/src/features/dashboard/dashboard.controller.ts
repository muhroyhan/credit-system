import type { AuthEnv } from '@server/constant/interface';
import { dashboardService } from '@server/features/dashboard/dashboard.service';
import type { Context } from 'hono';

async function data(c: Context<AuthEnv>) {
  return c.json(await dashboardService.data(c.get('identity')));
}
export const dashboardController = { data };
