import { connectDatabase } from '@credit/database/client';
import {
  debitors,
  entityTypes,
  userBiaya,
  userBungaKredit,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import type {
  CompanyInput,
  CompanyQuery,
} from '@server/features/companies/companies.type';
import { and, asc, count, desc, eq, inArray, like, ne, or } from 'drizzle-orm';

export const companiesRepository = {
  async list(query: CompanyQuery, paginate = true) {
    const db = connectDatabase().db;
    const where = and(
      query.email ? like(users.email, `%${query.email}%`) : undefined,
      query.username ? like(users.username, `%${query.username}%`) : undefined,
      query.companyName
        ? like(users.companyName, `%${query.companyName}%`)
        : undefined,
      query.entityTypeId
        ? eq(users.entityTypeId, query.entityTypeId)
        : undefined,
      query.status ? eq(users.status, query.status) : undefined,
    );
    const [total] = await db
      .select({ count: count() })
      .from(users)
      .where(where);
    const selection = db
      .select({
        id: users.id,
        companyName: users.companyName,
        entityTypeId: users.entityTypeId,
        entityType: entityTypes.value,
        email: users.email,
        username: users.username,
        slug: users.slug,
        status: users.status,
      })
      .from(users)
      .leftJoin(entityTypes, eq(users.entityTypeId, entityTypes.id))
      .where(where)
      .orderBy(
        (query.sortDirection === 'asc' ? asc : desc)(users[query.sortBy]),
        desc(users.id),
      );
    return {
      count: total?.count ?? 0,
      data: await (paginate
        ? selection.limit(query.limit).offset((query.page - 1) * query.limit)
        : selection),
    };
  },
  async bySlug(slug: string) {
    const db = connectDatabase().db;
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.slug, slug));
    return row?.id;
  },
  async detail(id: number) {
    const db = connectDatabase().db;
    const [row] = await db
      .select({
        id: users.id,
        entityTypeId: users.entityTypeId,
        companyName: users.companyName,
        email: users.email,
        username: users.username,
        slug: users.slug,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, id));
    if (!row) {
      return null;
    }
    const bungaKredits = await db
      .select({
        id: userBungaKredit.id,
        bungaPercentage: userBungaKredit.bungaPercentage,
        jangkaWaktuBulan: userBungaKredit.jangkaWaktuBulan,
      })
      .from(userBungaKredit)
      .where(eq(userBungaKredit.userId, id));
    const biaya = await db
      .select({
        id: userBiaya.id,
        expenseType: userBiaya.expenseType,
        type: userBiaya.type,
        value: userBiaya.value,
      })
      .from(userBiaya)
      .where(eq(userBiaya.userId, id));
    return { ...row, bungaKredits, biaya };
  },
  async lock(id: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .for('update');
    return row ?? null;
  },
  async conflict(
    input: CompanyInput,
    id: number | undefined,
    tx: DatabaseTransaction,
  ) {
    const [conflict] = await tx
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          or(
            eq(users.username, input.username),
            eq(users.email, input.email),
            eq(users.slug, input.slug),
            and(
              eq(users.companyName, input.companyName),
              eq(users.entityTypeId, input.entityTypeId),
            ),
          ),
          id ? ne(users.id, id) : undefined,
        ),
      )
      .limit(1);
    return !!conflict;
  },
  async entity(id: number, tx: DatabaseTransaction) {
    const [entity] = await tx
      .select({ id: entityTypes.id })
      .from(entityTypes)
      .where(eq(entityTypes.id, id));
    return entity ?? null;
  },
  async children(id: number | undefined, tx: DatabaseTransaction) {
    const oldInterests = id
      ? await tx
          .select({ id: userBungaKredit.id })
          .from(userBungaKredit)
          .where(eq(userBungaKredit.userId, id))
      : [];
    const oldExpenses = id
      ? await tx
          .select({ id: userBiaya.id })
          .from(userBiaya)
          .where(eq(userBiaya.userId, id))
      : [];
    return { oldInterests, oldExpenses };
  },
  async saveParent(
    input: CompanyInput,
    actor: string,
    id: number | undefined,
    tx: DatabaseTransaction,
  ) {
    const {
      bungaKredits: _interests,
      biaya: _expenses,
      password,
      ...parent
    } = input;
    let companyId = id;
    if (id) {
      await tx
        .update(users)
        .set({
          ...parent,
          ...(password ? { password } : {}),
          updatedBy: actor,
        })
        .where(eq(users.id, id));
    } else {
      const [created] = await tx
        .insert(users)
        .values({ ...parent, password, createdBy: actor, updatedBy: actor })
        .$returningId();
      companyId = created?.id;
    }
    return companyId;
  },
  async saveChildren(
    input: CompanyInput,
    actor: string,
    companyId: number,
    removeInterests: number[],
    removeExpenses: number[],
    tx: DatabaseTransaction,
  ) {
    const { bungaKredits, biaya } = input;
    if (removeInterests.length) {
      await tx
        .delete(userBungaKredit)
        .where(
          and(
            eq(userBungaKredit.userId, companyId),
            inArray(userBungaKredit.id, removeInterests),
          ),
        );
    }
    if (removeExpenses.length) {
      await tx
        .delete(userBiaya)
        .where(
          and(
            eq(userBiaya.userId, companyId),
            inArray(userBiaya.id, removeExpenses),
          ),
        );
    }
    for (const { id: childId, ...value } of bungaKredits) {
      if (childId) {
        await tx
          .update(userBungaKredit)
          .set({ ...value, updatedBy: actor })
          .where(
            and(
              eq(userBungaKredit.id, childId),
              eq(userBungaKredit.userId, companyId),
            ),
          );
      } else {
        await tx.insert(userBungaKredit).values({
          ...value,
          userId: companyId,
          createdBy: actor,
          updatedBy: actor,
        });
      }
    }
    for (const { id: childId, ...value } of biaya) {
      if (childId) {
        await tx
          .update(userBiaya)
          .set({ ...value, updatedBy: actor })
          .where(
            and(eq(userBiaya.id, childId), eq(userBiaya.userId, companyId)),
          );
      } else {
        await tx.insert(userBiaya).values({
          ...value,
          userId: companyId,
          createdBy: actor,
          updatedBy: actor,
        });
      }
    }
  },
  async hasDebitors(id: number, tx: DatabaseTransaction) {
    const [row] = await tx
      .select({ id: debitors.id })
      .from(debitors)
      .where(eq(debitors.userId, id))
      .limit(1);
    return !!row;
  },
  async remove(id: number, tx: DatabaseTransaction) {
    await tx.delete(userBiaya).where(eq(userBiaya.userId, id));
    await tx.delete(userBungaKredit).where(eq(userBungaKredit.userId, id));
    await tx.delete(users).where(eq(users.id, id));
    return true;
  },
};
