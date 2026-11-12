import { authenticate } from "@server/features/auth/application/identity";
import { loginRoute } from "@server/features/auth/presentation/routes";
import { referenceRepository } from "@server/features/reference/data/reference";
import { createReferenceRoutes } from "@server/features/reference/presentation/routes";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const health = app.get("/api/health", (c) => c.json({ status: "ok" as const }));
app.route(
  "/api",
  createReferenceRoutes(
    referenceRepository,
    async (header) => !!(await authenticate(header)),
  ),
);
app.route("/api", loginRoute);
type SchemaOf<T> = T extends Hono<infer _E, infer S, infer _P> ? S : never;
export type AppType = Hono<
  BlankEnv,
  SchemaOf<typeof health> &
    MergeSchemaPath<SchemaOf<typeof loginRoute>, "/api"> &
    MergeSchemaPath<SchemaOf<ReturnType<typeof createReferenceRoutes>>, "/api">
>;
