import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import type { RowDataPacket } from 'mysql2';
import { connectDatabase } from './client';

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
