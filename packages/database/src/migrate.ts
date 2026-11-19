import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { testDatabaseUrl } from '@credit/test-utils/database';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import type { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { connectDatabase } from './client';

if (process.argv.includes('--test')) {
  const url = testDatabaseUrl(process.env.TEST_DATABASE_URL);
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL for a disposable credit_*test is required',
    );
  }
  const target = new URL(url);
  const database = target.pathname.slice(1);
  target.pathname = '/';
  const connection = await mysql.createConnection(target.toString());
  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS ??', [database]);
  } finally {
    await connection.end();
  }
  process.env.DATABASE_URL = url;
}

const { db, pool } = connectDatabase();
try {
  const [tables] = await pool.query<RowDataPacket[]>(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()',
  );
  const hasHistory = tables.some(
    (table) => table.TABLE_NAME === '__drizzle_migrations',
  );
  if (hasHistory) {
    const [history] = await pool.query<RowDataPacket[]>(
      'SELECT hash FROM __drizzle_migrations',
    );
    const baseline = await readFile(
      'packages/database/drizzle/0000_baseline.sql',
      'utf8',
    );
    const expected = createHash('sha256').update(baseline).digest('hex');
    if (history.length !== 1 || history[0]?.hash !== expected) {
      throw new Error(
        'Migration history differs from baseline; use a fresh local database',
      );
    }
  } else if (tables.length > 0) {
    throw new Error(
      'Database has tables without baseline history; use a fresh local database',
    );
  }
  await migrate(db, { migrationsFolder: 'packages/database/drizzle' });
} finally {
  await pool.end();
}
