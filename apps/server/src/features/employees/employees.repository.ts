import type {
  EmployeeDocumentKind,
  EmployeeProfile,
  EmployeeQuery,
} from '@credit/contracts';
import { CreditStatusEnum, SortDirectionEnum } from '@credit/contracts';
import { connectDatabase } from '@credit/database/client';
import {
  credits,
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
import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  like,
  ne,
  or,
  sql,
} from 'drizzle-orm';

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
      query.search
        ? or(
            like(debitors.namaLengkap, `%${query.search}%`),
            like(debitors.namaAlias, `%${query.search}%`),
          )
        : undefined,
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
      .select({
        ...columns,
        sumPengajuan: sql<string>`(SELECT COALESCE(SUM(CAST(${credits.jumlahPengajuan} AS DECIMAL(20, 0))), 0) FROM ${credits} WHERE ${credits.debitorId} = ${debitors.id} AND ${credits.status} IN (${CreditStatusEnum.Pending}, ${CreditStatusEnum.Approved}))`,
      })
      .from(debitors)
      .leftJoin(users, eq(users.id, debitors.userId))
      .where(where)
      .orderBy(
        (query.sortDirection === SortDirectionEnum.Ascending ? asc : desc)(
          query.sortBy === 'companyName'
            ? users.companyName
            : debitors[query.sortBy],
        ),
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
      .limit(1)
      .for('update');
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
        .set({ ...input, updatedBy: actor })
        .where(eq(debitors.id, id));
      return id;
    }
    const [row] = await tx
      .insert(debitors)
      .values({ ...input, userId, createdBy: actor, updatedBy: actor })
      .$returningId();
    return row?.id;
  },
  async profile(id: number, tx?: DatabaseTransaction) {
    const db = tx ?? connectDatabase().db;
    const { password: _password, ...publicColumns } = getTableColumns(debitors);
    const parentQuery = db
      .select(publicColumns)
      .from(debitors)
      .where(eq(debitors.id, id));
    const dataQuery = db
      .select()
      .from(debitorData)
      .where(eq(debitorData.debitorId, id));
    const financialQuery = db
      .select({ takehomePay: debitorFinancial.takehomePay })
      .from(debitorFinancial)
      .where(eq(debitorFinancial.debitorId, id));
    const [parent] = await (tx ? parentQuery.for('update') : parentQuery);
    const [data] = await (tx ? dataQuery.for('update') : dataQuery);
    const [financial] = await (tx
      ? financialQuery.for('update')
      : financialQuery);
    return { parent, data, financial };
  },
  async saveProfile(
    id: number,
    profile: EmployeeProfile,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const { npwp, takehomePay, ...parent } = profile;
    await tx
      .update(debitors)
      .set({ ...parent, updatedBy: actor })
      .where(eq(debitors.id, id));
    const old = await employeesRepository.profile(id, tx);
    if (old.data) {
      await tx
        .update(debitorData)
        .set({ npwp, updatedBy: actor })
        .where(eq(debitorData.debitorId, id));
    } else {
      await tx
        .insert(debitorData)
        .values({ debitorId: id, npwp, createdBy: actor, updatedBy: actor });
    }
    if (old.financial) {
      await tx
        .update(debitorFinancial)
        .set({
          takehomePay: Number(takehomePay),
          updatedBy: actor,
        })
        .where(eq(debitorFinancial.debitorId, id));
    } else {
      await tx.insert(debitorFinancial).values({
        debitorId: id,
        takehomePay: Number(takehomePay),
        createdBy: actor,
        updatedBy: actor,
      });
    }
  },
  async saveDocuments(
    id: number,
    values: Partial<Record<EmployeeDocumentKind, string>>,
    actor: string,
    tx: DatabaseTransaction,
  ) {
    const old = await employeesRepository.profile(id, tx);
    if (old.data) {
      await tx
        .update(debitorData)
        .set({ ...values, updatedBy: actor })
        .where(eq(debitorData.debitorId, id));
    } else {
      await tx.insert(debitorData).values({
        ...values,
        debitorId: id,
        createdBy: actor,
        updatedBy: actor,
      });
    }
  },
  async hasCredit(id: number, tx: DatabaseTransaction) {
    const rows = await tx
      .select({ id: credits.id })
      .from(credits)
      .where(eq(credits.debitorId, id))
      .limit(1)
      .for('update');
    return rows.length > 0;
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
