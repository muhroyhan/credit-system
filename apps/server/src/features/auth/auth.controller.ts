import { loginSchema } from "@credit/contracts";
import { authService } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
export function authController() {
  const identityContext = createMiddleware<AuthEnv>(async (c, next) => {
    const identity = await authService.authenticate(
      c.req.header("Authorization"),
    );
    if (!identity) return c.json({ error: "unauthorized" }, 401);
    c.set("identity", identity);
    await next();
  });

  const app = new Hono();
  const loginRoute = app.post("/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid request" }, 400);
    const result = await authService.login(parsed.data);
    if (!result) return c.json({ error: "invalid credentials" }, 401);
    return c.json(result);
  });

  return { routes: loginRoute, identityContext };
}
