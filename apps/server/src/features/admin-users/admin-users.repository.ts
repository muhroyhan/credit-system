import { connectDatabase } from "@credit/database/client";
import { adminUsers, programs, roles } from "@credit/database/schema";
import {
  AdminConflict,
  AdminNotFound,
  type AdminRepository,
} from "@server/features/admin-users/admin-users.service";
import { and, count, desc, eq, inArray, like, ne, or } from "drizzle-orm";
export const adminUsersRepository: AdminRepository = {
  async list(query) {
    const db = connectDatabase().db;
    const conditions = [];
    if (query.email)
      conditions.push(like(adminUsers.email, `%${query.email}%`));
    if (query.username)
      conditions.push(like(adminUsers.username, `%${query.username}%`));
    if (query.active !== undefined)
      conditions.push(eq(adminUsers.isActive, query.active === "true"));
    const where = and(...conditions);
    const [total] = await db
      .select({ count: count() })
      .from(adminUsers)
      .where(where);
    const data = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(where)
      .orderBy(desc(adminUsers.createdAt), desc(adminUsers.id))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
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
    if (!user) return null;
    const userRoles = await db
      .select({ programId: roles.programId, value: roles.value })
      .from(roles)
      .where(eq(roles.adminUserId, id));
    return { ...user, roles: userRoles };
  },
  async save(input, actor, id) {
    const db = connectDatabase().db;
    return db.transaction(async (tx) => {
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
      if (conflict.length)
        throw new AdminConflict("Username atau email sudah digunakan");
      const ids = input.roles.map((role) => role.programId);
      if (ids.length) {
        const found = await tx
          .select({ id: programs.id })
          .from(programs)
          .where(inArray(programs.id, ids));
        if (found.length !== ids.length)
          throw new AdminConflict("Program tidak tersedia");
      }
      let userId = id;
      if (userId) {
        const [existing] = await tx
          .select({ id: adminUsers.id })
          .from(adminUsers)
          .where(eq(adminUsers.id, userId));
        if (!existing) throw new AdminNotFound();
        await tx
          .update(adminUsers)
          .set({
            username: input.username,
            email: input.email,
            isActive: input.isActive,
            ...(input.password ? { password: input.password } : {}),
            updatedBy: actor,
            updatedAt: new Date(),
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
      if (input.roles.length)
        await tx.insert(roles).values(
          input.roles.map((role) => ({
            adminUserId: userId,
            programId: role.programId,
            value: role.value,
          })),
        );
      return userId;
    });
  },
  async remove(id) {
    const db = connectDatabase().db;
    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(eq(adminUsers.id, id));
      if (!existing) return false;
      await tx.delete(roles).where(eq(roles.adminUserId, id));
      await tx.delete(adminUsers).where(eq(adminUsers.id, id));
      return true;
    });
  },
};
