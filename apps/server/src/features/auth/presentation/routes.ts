import { loginSchema } from "@credit/contracts";
import { login } from "@server/features/auth/application/login";
import { findAccount } from "@server/features/auth/data/accounts";
import { Hono } from "hono";
export const authRoutes = new Hono();
export const loginRoute = authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid request" }, 400);
  const result = await login(parsed.data, findAccount);
  if (!result) return c.json({ error: "invalid credentials" }, 401);
  return c.json(result);
});
