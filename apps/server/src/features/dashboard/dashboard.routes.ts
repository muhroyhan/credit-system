import type { AuthEnv } from '@server/constant/interface';
import { dashboardController } from '@server/features/dashboard/dashboard.controller';
import { identityContext } from '@server/middleware/identity-context.middleware';
import { Hono } from 'hono';
export function dashboardRoutes() {
  const app = new Hono<AuthEnv>();
  return app.get('/data', identityContext, dashboardController.data);
}
