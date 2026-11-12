import { resolve } from "node:path";
import { closeDatabase } from "@credit/database/client";
import { serveStatic } from "hono/bun";
import { app } from "./app";

const webRoot = resolve(import.meta.dir, "../../web/dist");
app.use("/*", serveStatic({ root: webRoot }));
app.get("/*", async (c) => {
  const path = c.req.path;
  if (
    path === "/api" ||
    path.startsWith("/api/") ||
    path.startsWith("/assets/") ||
    path.includes(".")
  )
    return c.notFound();
  const file = Bun.file(resolve(webRoot, "index.html"));
  return (await file.exists())
    ? new Response(file, { headers: { "content-type": "text/html" } })
    : c.notFound();
});
export default { port: Number(process.env.PORT ?? 3000), fetch: app.fetch };

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Database shutdown failed", error);
    process.exit(1);
  }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
