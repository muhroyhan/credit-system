import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import { authController } from "@server/features/auth/auth.controller";
import { referenceController } from "@server/features/reference/reference.controller";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const auth = authController();
const loginRoute = auth.routes;
const adminRoutes = adminUsersController(auth.identityContext);
const api = referenceController(auth.identityContext);
const health = api.get("/health", (c) => c.json({ status: "ok" as const }));
api.route("/", loginRoute);
api.route("/", adminRoutes);
type ApiSchema = SchemaOf<typeof health> &
  SchemaOf<typeof loginRoute> &
  SchemaOf<typeof adminRoutes>;
app.route("/api", api);
export type AppType = Hono<BlankEnv, MergeSchemaPath<ApiSchema, "/api">>;
