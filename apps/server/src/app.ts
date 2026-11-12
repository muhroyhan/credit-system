import { adminRepository } from "@server/features/admin-users/repository.data";
import { createAdminRoutes } from "@server/features/admin-users/routes.presentation";
import { findAccount } from "@server/features/auth/accounts.data";
import { createAuthRoutes } from "@server/features/auth/routes.presentation";
import { referenceRepository } from "@server/features/reference/reference.data";
import { createReferenceRoutes } from "@server/features/reference/routes.presentation";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const loginRoute = createAuthRoutes(findAccount);
const adminRoutes = createAdminRoutes(adminRepository);
const api = createReferenceRoutes(referenceRepository);
const health = api.get("/health", (c) => c.json({ status: "ok" as const }));
api.route("/", loginRoute);
api.route("/", adminRoutes);
type ApiSchema = SchemaOf<typeof health> &
  SchemaOf<typeof loginRoute> &
  SchemaOf<typeof adminRoutes>;
app.route("/api", api);
export type AppType = Hono<BlankEnv, MergeSchemaPath<ApiSchema, "/api">>;
