import { adminUsersController } from "@server/features/admin-users/admin-users.controller";
import { adminUsersRepository } from "@server/features/admin-users/admin-users.repository";
import { authController } from "@server/features/auth/auth.controller";
import { authRepository } from "@server/features/auth/auth.repository";
import { referenceController } from "@server/features/reference/reference.controller";
import { referenceRepository } from "@server/features/reference/reference.repository";
import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const loginRoute = authController(authRepository.findAccount);
const adminRoutes = adminUsersController(adminUsersRepository);
const api = referenceController(referenceRepository);
const health = api.get("/health", (c) => c.json({ status: "ok" as const }));
api.route("/", loginRoute);
api.route("/", adminRoutes);
type ApiSchema = SchemaOf<typeof health> &
  SchemaOf<typeof loginRoute> &
  SchemaOf<typeof adminRoutes>;
app.route("/api", api);
export type AppType = Hono<BlankEnv, MergeSchemaPath<ApiSchema, "/api">>;
