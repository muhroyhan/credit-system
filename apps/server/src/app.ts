import type { SchemaOf } from "@server/infrastructure/rpc-types";
import { routes } from "@server/routes";
import { Hono } from "hono";
import type { BlankEnv, MergeSchemaPath } from "hono/types";
export const app = new Hono();
app.route("/api", routes());
export type AppType = Hono<
  BlankEnv,
  MergeSchemaPath<SchemaOf<ReturnType<typeof routes>>, "/api">
>;
