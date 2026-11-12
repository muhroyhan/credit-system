import { authService } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { createMiddleware } from "hono/factory";
export const identityContext = createMiddleware<AuthEnv>(async (c, next) => {
  const identity = await authService.authenticate(
    c.req.header("Authorization"),
  );
  if (!identity) return c.json({ error: "unauthorized" }, 401);
  c.set("identity", identity);
  await next();
});
