import { Hono } from "hono";

export function healthController() {
  const app = new Hono();
  const health = app.get("/health", (c) => c.json({ status: "ok" as const }));
  return health;
}
