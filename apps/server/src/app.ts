import { referenceRepository } from "@server/features/reference/data/reference";
import { createReferenceRoutes } from "@server/features/reference/presentation/routes";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
const health = app.get("/api/health", (c) => c.json({ status: "ok" as const }));
app.route("/api", createReferenceRoutes(referenceRepository));
type SchemaOf<T> = T extends Hono<infer _E, infer S, infer _P> ? S : never;
export type AppType = Hono<
  BlankEnv,
  SchemaOf<typeof health> &
    MergeSchemaPath<SchemaOf<ReturnType<typeof createReferenceRoutes>>, "/api">
>;
