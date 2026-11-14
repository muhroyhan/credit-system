import { closeDatabase } from '@credit/database/client';

/** Closes the shared database pool once when the server process stops. */
export function registerShutdown() {
  let shuttingDown = false;
  async function shutdown() {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    try {
      await closeDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Database shutdown failed', error);
      process.exit(1);
    }
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
