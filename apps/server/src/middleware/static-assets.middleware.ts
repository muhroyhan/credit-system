import { serveStatic } from "hono/bun";
export function staticAssets(root: string) {
  return serveStatic({ root });
}
