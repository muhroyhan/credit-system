import { isAbsolute, relative, resolve } from 'node:path';
import { testDatabaseUrl } from '@credit/test-utils/database';

/** Fails before opening SQL or starting Bun if isolated fixtures are missing. */
export function requireTestEnvironment() {
  if (!testDatabaseUrl(process.env.DATABASE_URL)) {
    throw new Error('DATABASE_URL for a disposable credit_*test is required');
  }
  for (const key of ['JWT_SECRET', 'SEED_PASSWORD']) {
    if (!process.env[key]) {
      throw new Error(`${key} must contain a synthetic test value`);
    }
  }
  if (process.env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('Live WhatsApp credentials must be absent during tests');
  }
  const storage = process.env.DOCUMENT_STORAGE_DIR;
  const root = resolve('.data/qa');
  const child = storage ? relative(root, resolve(storage)) : '..';
  if (!storage || child.startsWith('..') || isAbsolute(child)) {
    throw new Error('DOCUMENT_STORAGE_DIR must be inside .data/qa');
  }
  process.env.TZ = 'Asia/Jakarta';
}
