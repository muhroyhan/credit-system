import { connectDatabase } from '@credit/database/client';
import { adminUsers, programs, roles } from '@credit/database/schema';
import type { AdminRepository } from '@server/features/admin-users/admin-users.type';
import { and, asc, count, desc, eq, inArray, like, ne, or } from 'drizzle-orm';

export const adminUsersRepository: AdminRepository = {
  async list(query, paginate = true) {
    const db = connectDatabase().db;
    const conditions = [];
    if (query.email) {
      conditions.push(like(adminUsers.email, `%${query.email}%`));
    }
    if (query.username) {
      conditions.push(like(adminUsers.username, `%${query.username}%`));
    }
    if (query.active !== undefined) {
      conditions.push(eq(adminUsers.isActive, query.active === 'true'));
    }
    const where = and(...conditions);
    const [total] = await db
      .select({ count: count() })
      .from(adminUsers)
      .where(where);
    const dataQuery = db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(where)
      .orderBy(
        (query.sortDirection === 'asc' ? asc : desc)(adminUsers[query.sortBy]),
        desc(adminUsers.id),
      );
    const data = await (paginate
      ? dataQuery.limit(query.limit).offset((query.page - 1) * query.limit)
      : dataQuery);
    const assignedRoles = data.length
      ? await db
          .select({
            adminUserId: roles.adminUserId,
            programId: roles.programId,
            value: roles.value,
            program: programs.name,
            abbreviation: programs.abbreviation,
          })
          .from(roles)
          .leftJoin(programs, eq(roles.programId, programs.id))
          .where(
            inArray(
              roles.adminUserId,
              data.map((user) => user.id),
            ),
          )
      : [];
    return {
      count: total?.count ?? 0,
      data: data.map((user) => ({
        ...user,
        roles: assignedRoles.filter((role) => role.adminUserId === user.id),
      })),
    };
  },
  async detail(id) {
    const db = connectDatabase().db;
    const [user] = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    if (!user) {
      return null;
    }
    const userRoles = await db
      .select({ programId: roles.programId, value: roles.value })
      .from(roles)
      .where(eq(roles.adminUserId, id));
    return { ...user, roles: userRoles };
  },
  async conflict(input, id, tx) {
    const conflict = await tx
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(
        and(
          or(
            eq(adminUsers.username, input.username),
            eq(adminUsers.email, input.email),
          ),
          id ? ne(adminUsers.id, id) : undefined,
        ),
      )
      .limit(1);
    return conflict.length > 0;
  },
  async programs(ids, tx) {
    if (!ids.length) {
      return [];
    }
    const found = await tx
      .select({ id: programs.id })
      .from(programs)
      .where(inArray(programs.id, ids));
    return found;
  },
  async lock(id, tx) {
    const [row] = await tx
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .for('update');
    return row ?? null;
  },
  async save(input, actor, id, tx) {
    let userId = id;
    if (userId) {
      await tx
        .update(adminUsers)
        .set({
          username: input.username,
          email: input.email,
          isActive: input.isActive,
          ...(input.password ? { password: input.password } : {}),
          updatedBy: actor,
        })
        .where(eq(adminUsers.id, userId));
      await tx.delete(roles).where(eq(roles.adminUserId, userId));
    } else {
      const [result] = await tx.insert(adminUsers).values({
        username: input.username,
        email: input.email,
        password: input.password,
        isActive: input.isActive,
        createdBy: actor,
        updatedBy: actor,
      });
      userId = result.insertId;
    }
    if (input.roles.length) {
      await tx.insert(roles).values(
        input.roles.map((role) => ({
          adminUserId: userId,
          programId: role.programId,
          value: role.value,
        })),
      );
    }
    return userId;
  },
  async remove(id, tx) {
    await tx.delete(roles).where(eq(roles.adminUserId, id));
    await tx.delete(adminUsers).where(eq(adminUsers.id, id));
    return true;
  },
};
