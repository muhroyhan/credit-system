import { resolveIdentity } from "@server/features/auth/accounts.data";
import {
  authenticate,
  type Identity,
} from "@server/features/auth/identity.application";
import { createMiddleware } from "hono/factory";

export type AuthEnv = { Variables: { identity: Identity } };
export const identityContext = createMiddleware<AuthEnv>(async (c, next) => {
  const identity = await authenticate(
    c.req.header("Authorization"),
    resolveIdentity,
  );
  if (!identity) return c.json({ error: "unauthorized" }, 401);
  c.set("identity", identity);
  await next();
});
