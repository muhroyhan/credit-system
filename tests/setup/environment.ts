import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { testDatabaseUrl } from '@credit/test-utils/database';

/** Loads local fixtures and validates isolation before SQL or Bun starts. */
export function requireTestEnvironment() {
  if (existsSync('.env')) {
    loadEnvFile('.env');
  }
  const databaseUrl = testDatabaseUrl(process.env.TEST_DATABASE_URL);
  if (!databaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL for a disposable credit_*test is required',
    );
  }
  for (const key of ['JWT_SECRET', 'SEED_PASSWORD']) {
    if (!process.env[key]) {
      throw new Error(`${key} must contain a synthetic test value`);
    }
  }
  if (process.env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('Live WhatsApp credentials must be absent during tests');
  }
  const storage = process.env.TEST_DOCUMENT_STORAGE_DIR;
  const root = resolve('.data/qa');
  const child = storage ? relative(root, resolve(storage)) : '..';
  if (!storage || child.startsWith('..') || isAbsolute(child)) {
    throw new Error('TEST_DOCUMENT_STORAGE_DIR must be inside .data/qa');
  }
  process.env.DATABASE_URL = databaseUrl;
  process.env.DOCUMENT_STORAGE_DIR = resolve(storage);
  process.env.TZ = 'Asia/Jakarta';
}
