import { loginSchema } from "@credit/contracts";
import { authService } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

const identityContext = createMiddleware<AuthEnv>(async (c, next) => {
  const identity = await authService.authenticate(
    c.req.header("Authorization"),
  );
  if (!identity) return c.json({ error: "unauthorized" }, 401);
  c.set("identity", identity);
  await next();
});

const login = async (c: Context<AuthEnv>) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const result = await authService.login(parsed.data);
  if (!result) return c.json({ error: "invalid credentials" }, 401);
  return c.json(result);
};

export const authController = { login, identityContext };
