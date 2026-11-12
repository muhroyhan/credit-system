import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

function createConnection(url: string) {
  const pool = mysql.createPool(url);
  return { db: drizzle(pool), pool };
}
type DatabaseConnection = ReturnType<typeof createConnection>;
let connection: DatabaseConnection | undefined;
let closing: Promise<void> | undefined;

export function connectDatabase(): DatabaseConnection {
  if (closing) {
    throw new Error('Database is shutting down');
  }
  if (connection) {
    return connection;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  connection = createConnection(url);
  return connection;
}

export async function closeDatabase(): Promise<void> {
  if (!closing) {
    closing = connection ? connection.pool.end() : Promise.resolve();
  }
  await closing;
}
