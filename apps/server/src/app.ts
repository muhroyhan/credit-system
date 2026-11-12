import { Hono } from "hono";

export const app = new Hono().get("/api/health", (c) =>
  c.json({ status: "ok" as const }),
);
export type AppType = typeof app;
