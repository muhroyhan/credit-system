import { resolve } from "node:path";
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
