import { connectDatabase } from "./client";
const { pool } = connectDatabase();
try { await pool.query("SELECT 1"); console.log("No seed data defined yet"); } finally { await pool.end(); }
