import { loginSchema } from "@credit/contracts";
import {
  type AccountLookup,
  login,
} from "@server/features/auth/application/login";
import { Hono } from "hono";
export function createAuthRoutes(findAccount: AccountLookup) {
  const app = new Hono();
  const loginRoute = app.post("/login", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: "invalid request" }, 400);
    const result = await login(parsed.data, findAccount);
    if (!result) return c.json({ error: "invalid credentials" }, 401);
    return c.json(result);
  });

  return loginRoute;
}
