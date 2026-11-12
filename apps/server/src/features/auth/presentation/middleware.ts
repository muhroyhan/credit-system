import {
  authenticate,
  hasProgramPermission,
  type Identity,
} from "@server/features/auth/application/identity";
import { resolveIdentity } from "@server/features/auth/data/accounts";
import { createMiddleware } from "hono/factory";

type AuthEnv = { Variables: { identity: Identity } };
export const identityContext = createMiddleware<AuthEnv>(async (c, next) => {
  const identity = await authenticate(
    c.req.header("Authorization"),
    resolveIdentity,
  );
  if (!identity) return c.json({ error: "unauthorized" }, 401);
  c.set("identity", identity);
  await next();
});
export function requireProgram(program: string, access: "READ" | "WRITE") {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const identity = c.get("identity");
    if (!identity || !hasProgramPermission(identity, program, access))
      return c.json({ error: "forbidden" }, 403);
    await next();
  });
}
