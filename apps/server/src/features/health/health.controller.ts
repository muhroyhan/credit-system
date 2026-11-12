import type { AuthEnv } from "@server/features/auth/auth.type";
import type { Context } from "hono";
export const healthController = {
  health: (c: Context<AuthEnv>) => c.json({ status: "ok" as const }),
};
