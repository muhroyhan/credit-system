import { authController } from "@server/features/auth/auth.controller";
import type { AuthEnv } from "@server/features/auth/auth.type";
import type { Hono } from "hono";
export function authRoutes(app: Hono<AuthEnv>) {
  return app.post("/login", authController.login);
}
