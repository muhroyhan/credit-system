import { authService } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { createMiddleware } from "hono/factory";
export function permission(acl: string) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    if (!authService.hasAclPermission(c.get("identity"), acl))
      return c.json({ error: "forbidden" }, 403);
    await next();
  });
}
