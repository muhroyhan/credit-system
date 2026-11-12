import { adminRepository } from "@server/features/admin-users/data/repository";
import { createAdminRoutes } from "@server/features/admin-users/presentation/routes";
import { findAccount } from "@server/features/auth/data/accounts";
import { createAuthRoutes } from "@server/features/auth/presentation/routes";
import { referenceRepository } from "@server/features/reference/data/reference";
import { createReferenceRoutes } from "@server/features/reference/presentation/routes";
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
