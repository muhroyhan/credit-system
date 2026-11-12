import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
export function connectDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const pool = mysql.createPool(url);
  return { db: drizzle(pool), pool };
}
