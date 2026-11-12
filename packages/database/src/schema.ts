import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  int,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";

const id = () => int("id", { unsigned: true }).primaryKey().autoincrement();
const timestamps = () => ({
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
const audit = () => ({
  ...timestamps(),
  createdBy: varchar("created_by", { length: 255 }),
  updatedBy: varchar("updated_by", { length: 255 }),
});
const str = (name: string) => varchar(name, { length: 255 });
const ref = (name: string) => int(name, { unsigned: true });
export const constants = mysqlTable("constant", {
  id: id(),
  name: str("name"),
  type: str("type"),
  value: str("value"),
  ...audit(),
});
export const countries = mysqlTable("country", {
  id: id(),
  code: str("code"),
  value: str("value"),
  ...audit(),
});
export const entityTypes = mysqlTable("entity_type", {
  id: id(),
  value: str("value"),
  ...timestamps(),
});
export const programs = mysqlTable("program", {
  id: id(),
  abbreviation: str("abbreviation"),
  name: str("name"),
  ...timestamps(),
});
export const adminUsers = mysqlTable("admin_user", {
  id: id(),
  isActive: boolean("is_active"),
  email: str("email"),
  password: str("password"),
  username: str("username"),
  ...audit(),
});
export const roles = mysqlTable("role", {
  id: id(),
  adminUserId: ref("admin_user_id"),
  programId: ref("program_id"),
  value: str("value"),
  ...timestamps(),
});
export const users = mysqlTable("user", {
  id: id(),
  entityTypeId: ref("entity_type_id"),
  companyName: str("company_name"),
  email: str("email"),
  password: str("password"),
  slug: str("slug"),
  status: str("status"),
  username: str("username"),
  ...audit(),
});
export const userBiaya = mysqlTable("user_biaya", {
  id: id(),
  userId: ref("user_id"),
  expenseType: str("expense_type"),
  type: str("type"),
  value: int("value"),
  ...audit(),
});
export const userBungaKredit = mysqlTable("user_bunga_kredit", {
  id: id(),
  userId: ref("user_id"),
  bungaPercentage: str("bunga_percentage"),
  jangkaWaktuBulan: str("jangka_waktu_bulan"),
  ...audit(),
});
export const debitors = mysqlTable("debitor", {
  id: id(),
  userId: ref("user_id"),
  username: str("username"),
  password: str("password"),
  namaLengkap: str("nama_lengkap"),
  ...audit(),
});
