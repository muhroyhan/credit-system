import { authService } from "@server/features/auth/auth.service";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { createMiddleware } from "hono/factory";
export const companyWritePermission = createMiddleware<AuthEnv>(
  async (c, next) => {
    if (!authService.hasProgramPermission(c.get("identity"), "USC", "WRITE"))
      return c.json({ error: "forbidden" }, 403);
    await next();
  },
);
