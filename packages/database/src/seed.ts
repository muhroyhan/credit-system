import { sql } from "drizzle-orm";
import { connectDatabase } from "./client";

const { db, pool } = connectDatabase();
try {
  await db.execute(sql`SELECT 1`);
  console.log("No seed data defined yet");
} finally {
  await pool.end();
}
