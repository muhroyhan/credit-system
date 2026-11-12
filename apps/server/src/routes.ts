import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import { authController } from "@server/features/auth/auth.controller";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { healthController } from "@server/features/health/health.controller";
import { referenceController } from "@server/features/reference/reference.controller";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import type { Hono } from "hono";

export function routes() {
  const auth = authController();
  const loginRoute = auth.routes;
  const adminRoutes = adminUsersController(auth.identityContext);
  const api = referenceController(auth.identityContext);
  const health = healthController();
  api.route("/", health);
  api.route("/", loginRoute);
  api.route("/", adminRoutes);
  type ApiSchema = SchemaOf<typeof api> &
    SchemaOf<typeof health> &
    SchemaOf<typeof loginRoute> &
    SchemaOf<typeof adminRoutes>;
  return api as Hono<AuthEnv, ApiSchema>;
}
