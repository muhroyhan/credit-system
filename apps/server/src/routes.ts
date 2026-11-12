import { adminUsersRoutes } from "@server/features/admin-users/admin-users.routes";
import { authRoutes } from "@server/features/auth/auth.routes";
import type { AuthEnv } from "@server/features/auth/auth.type";
import { companiesRoutes } from "@server/features/companies/companies.routes";
import { healthRoutes } from "@server/features/health/health.routes";
import { referenceRoutes } from "@server/features/reference/reference.routes";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";
import type { MergeSchemaPath } from "hono/types";
export function routes() {
  const app = new Hono<AuthEnv>();
  const health = healthRoutes(app);
  const auth = authRoutes(app);
  const reference = referenceRoutes(app);
  const admin = adminUsersRoutes();
  const companies = companiesRoutes();
  app.route("/admin-user", admin);
  app.route("/user", companies);
  type ApiSchema = SchemaOf<typeof health> &
    SchemaOf<typeof auth> &
    SchemaOf<typeof reference> &
    MergeSchemaPath<SchemaOf<typeof admin>, "/admin-user"> &
    MergeSchemaPath<SchemaOf<typeof companies>, "/user">;
  return app as Hono<AuthEnv, ApiSchema>;
}
