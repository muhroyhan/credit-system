import type { AuthEnv } from "@server/constant/type";
import { healthController } from "@server/features/health/health.controller";
import type { Hono } from "hono";
export function healthRoutes(app: Hono<AuthEnv>) {
  return app.get("/health", healthController.health);
}
