import type { AuthEnv } from "@server/constant/type";
import type { Context } from "hono";
export const healthController = {
  health: (c: Context<AuthEnv>) => c.json({ status: "ok" as const }),
};
