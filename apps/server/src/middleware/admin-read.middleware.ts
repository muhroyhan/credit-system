import { hasProgramPermission } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { createMiddleware } from "hono/factory";
export const adminReadPermission = createMiddleware<AuthEnv>(
  async (c, next) => {
    if (!hasProgramPermission(c.get("identity"), "USA", "READ"))
      return c.json({ error: "forbidden" }, 403);
    await next();
  },
);
