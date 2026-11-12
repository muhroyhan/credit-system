import { migrate } from 'drizzle-orm/mysql2/migrator';
import { connectDatabase } from './client';

const { db, pool } = connectDatabase();
try {
  await migrate(db, { migrationsFolder: 'packages/database/drizzle' });
} finally {
  await pool.end();
}
