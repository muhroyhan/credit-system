import { adminRoutes } from "@server/features/admin-users/presentation/routes";
import { loginRoute } from "@server/features/auth/presentation/routes";
import { referenceRepository } from "@server/features/reference/data/reference";
import { createReferenceRoutes } from "@server/features/reference/presentation/routes";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const api = createReferenceRoutes(referenceRepository);
const health = api.get("/health", (c) => c.json({ status: "ok" as const }));
api.route("/", loginRoute);
api.route("/", adminRoutes);
type SchemaOf<T> = T extends Hono<infer _E, infer S, infer _P> ? S : never;
type ApiSchema = SchemaOf<typeof health> &
  SchemaOf<typeof loginRoute> &
  SchemaOf<typeof adminRoutes>;
app.route("/api", api);
export type AppType = Hono<BlankEnv, MergeSchemaPath<ApiSchema, "/api">>;
