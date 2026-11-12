import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "mysql",
  schema: "./packages/database/src/schema.ts",
  out: "./packages/database/drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
