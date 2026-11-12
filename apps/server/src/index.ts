import { serveStatic } from "hono/bun";
import { app } from "./app";

app.use("/*", serveStatic({ root: "./apps/web/dist" }));
app.get("/*", async (c) => {
  const path = c.req.path;
  if (path.startsWith("/api/") || path.startsWith("/assets/") || path.includes(".")) return c.notFound();
  const file = Bun.file("./apps/web/dist/index.html");
  return (await file.exists()) ? new Response(file, { headers: { "content-type": "text/html" } }) : c.notFound();
});
export default { port: Number(process.env.PORT ?? 3000), fetch: app.fetch };
