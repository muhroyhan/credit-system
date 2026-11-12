import { loginSchema } from '@credit/contracts';
import type { AuthEnv } from '@server/constant/interface';
import { authService } from '@server/features/auth/auth.service';
import type { Context } from 'hono';

async function login(c: Context<AuthEnv>) {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid request' }, 400);
  }
  const result = await authService.login(parsed.data);
  if (!result) {
    return c.json({ error: 'invalid credentials' }, 401);
  }
  return c.json(result);
}

export const authController = { login };
