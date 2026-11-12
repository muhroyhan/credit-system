import type { AuthEnv } from '@server/constant/interface';
import type { Context } from 'hono';

export const healthController = {
  health: (c: Context<AuthEnv>) => c.json({ status: 'ok' as const }),
};
