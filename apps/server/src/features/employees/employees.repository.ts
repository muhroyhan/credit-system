import type { EmployeeQuery } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  debitorData,
  debitorFamily,
  debitorFinancial,
  debitorGps,
  debitorOthers,
  debitorSlik,
  debitors,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type { EmployeeWrite } from '@server/features/employees/employees.type';
import { and, asc, count, desc, eq, like, ne, sql } from 'drizzle-orm';

const columns = {
  id: debitors.id,
  userId: debitors.userId,
  username: debitors.username,
  namaLengkap: debitors.namaLengkap,
  namaAlias: debitors.namaAlias,
  employeeId: debitors.employeeId,
  noKtp: debitors.noKtp,
  companyName: users.companyName,
};
export const employeesRepository = {
  async company(slug: string, tx?: DatabaseTransaction) {
    const db = tx ?? connectDatabase().db;
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.slug, slug))
      .limit(1);
    return row ?? null;
  },
  async lockCompany(id: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .for('update');
    return row ?? null;
  },
  async account(id: number, tx?: DatabaseTransaction) {
    const db = tx ?? connectDatabase().db;
    const query = db
      .select(columns)
      .from(debitors)
      .leftJoin(users, eq(users.id, debitors.userId))
      .where(eq(debitors.id, id));
    const [row] = await (tx ? query.for('update') : query);
    return row ?? null;
  },
  async list(
    query: EmployeeQuery,
    userId?: number,
    debitorId?: number,
    paginate = true,
  ) {
    const db = connectDatabase().db;
    const where = and(
      userId ? eq(debitors.userId, userId) : undefined,
      debitorId ? eq(debitors.id, debitorId) : undefined,
      query.namaLengkap
        ? like(debitors.namaLengkap, `%${query.namaLengkap}%`)
        : undefined,
      query.namaAlias
        ? like(debitors.namaAlias, `%${query.namaAlias}%`)
        : undefined,
    );
    const [total] = await db
      .select({ count: count() })
      .from(debitors)
      .where(where);
    const selection = db
      .select(columns)
      .from(debitors)
      .leftJoin(users, eq(users.id, debitors.userId))
      .where(where)
      .orderBy(
        (query.sortDirection === 'asc' ? asc : desc)(debitors[query.sortBy]),
        desc(debitors.id),
      );
    return {
      count: total?.count ?? 0,
      data: await (paginate
        ? selection.limit(query.limit).offset((query.page - 1) * query.limit)
        : selection),
    };
  },
  async conflict(
    username: string,
    userId: number,
    id: number | undefined,
    tx: DatabaseTransaction,
  ) {
    const [row] = await tx
      .select({ id: debitors.id })
      .from(debitors)
      .where(
        and(
          eq(debitors.userId, userId),
          eq(debitors.username, username),
          id ? ne(debitors.id, id) : undefined,
        ),
      )
      .limit(1);
    return !!row;
  },
  async save(
    input: EmployeeWrite,
    userId: number,
    actor: string,
    id: number | undefined,
    tx: DatabaseTransaction,
  ) {
    if (id) {
      await tx
        .update(debitors)
        .set({ ...input, updatedBy: actor, updatedAt: new Date() })
        .where(eq(debitors.id, id));
      return id;
    }
    const [row] = await tx
      .insert(debitors)
      .values({ ...input, userId, createdBy: actor, updatedBy: actor })
      .$returningId();
    return row?.id;
  },
  async hasCredit(id: number, tx: DatabaseTransaction) {
    const [tables] = await tx.execute(
      sql`SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'credit'`,
    );
    if (!Array.isArray(tables) || !tables.length) {
      return false;
    }
    const [rows] = await tx.execute(
      sql`SELECT id FROM credit WHERE debitor_id = ${id} LIMIT 1`,
    );
    return Array.isArray(rows) && rows.length > 0;
  },
  async remove(id: number, tx: DatabaseTransaction) {
    for (const table of [
      debitorData,
      debitorFamily,
      debitorFinancial,
      debitorGps,
      debitorOthers,
      debitorSlik,
    ]) {
      await tx.delete(table).where(eq(table.debitorId, id));
    }
    await tx.delete(debitors).where(eq(debitors.id, id));
  },
};
