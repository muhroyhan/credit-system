import { referenceRepository } from "@server/features/reference/data/reference";
import { createReferenceRoutes } from "@server/features/reference/presentation/routes";
import { Hono } from "hono";
export const app = new Hono()
  .get("/api/health", (c) => c.json({ status: "ok" as const }))
  .route("/api", createReferenceRoutes(referenceRepository));
export type AppType = typeof app;
