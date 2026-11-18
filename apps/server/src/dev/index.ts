import { app } from '@server/app';
import { registerShutdown } from '@server/utils/shutdown';

registerShutdown();

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
});
console.info(`API development server: http://localhost:${server.port}`);
