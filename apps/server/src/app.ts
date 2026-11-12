import { Hono } from "hono";
import { referenceRepository } from "./features/reference/data/reference";
import { createReferenceRoutes } from "./features/reference/presentation/routes";
export const app = new Hono()
  .get("/api/health", (c) => c.json({ status: "ok" as const }))
  .route("/api", createReferenceRoutes(referenceRepository));
export type AppType = typeof app;
