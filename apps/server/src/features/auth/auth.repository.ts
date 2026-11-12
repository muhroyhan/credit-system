import { connectDatabase } from '@credit/database/client';
import {
  adminUsers,
  debitors,
  programs,
  roles,
  users,
} from '@credit/database/schema';
import type { DatabaseTransaction } from '@server/constant/type';
import { and, eq, or } from 'drizzle-orm';

export async function findAccount(
  type: 'admin' | 'company' | 'debitor',
  username: string,
  slug?: string,
  transaction?: DatabaseTransaction,
) {
  const db = transaction ?? connectDatabase().db;
  if (type === 'admin') {
    const [account] = await db
      .select()
      .from(adminUsers)
      .where(
        or(eq(adminUsers.username, username), eq(adminUsers.email, username)),
      )
      .limit(1);
    if (!account?.isActive) {
      return null;
    }
    const permissions = await db
      .select({ program: programs.abbreviation, value: roles.value })
      .from(roles)
      .innerJoin(programs, eq(roles.programId, programs.id))
      .where(eq(roles.adminUserId, account.id));
    return {
      id: account.id,
      slug: 'admin',
      password: account.password,
      userData: {
        id: account.id,
        username: account.username,
        email: account.email,
        roles: permissions,
      },
    };
  }
  if (!slug) {
    return null;
  }
  const [company] = await db
    .select()
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);
  if (!company) {
    return null;
  }
  if (type === 'company') {
    if (
      company.status !== 'active' ||
      (company.username !== username && company.email !== username)
    ) {
      return null;
    }
    return {
      id: company.id,
      slug,
      password: company.password,
      userData: {
        id: company.id,
        username: company.username,
        companyName: company.companyName,
        slug,
      },
    };
  }
  const [debitor] = await db
    .select()
    .from(debitors)
    .where(
      and(eq(debitors.userId, company.id), eq(debitors.username, username)),
    )
    .limit(1);
  if (!debitor) {
    return null;
  }
  return {
    id: debitor.id,
    slug,
    password: debitor.password,
    userData: {
      id: debitor.id,
      username: debitor.username,
      namaLengkap: debitor.namaLengkap,
      slug,
    },
  };
}

export async function resolveIdentity(
  type: 'admin' | 'company' | 'debitor',
  id: number,
  slug: string,
) {
  const db = connectDatabase().db;
  if (type === 'admin') {
    if (slug !== 'admin') {
      return null;
    }
    const [account] = await db
      .select({ id: adminUsers.id, active: adminUsers.isActive })
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1);
    if (!account?.active) {
      return null;
    }
    const permissions = await db
      .select({ program: programs.abbreviation, value: roles.value })
      .from(roles)
      .innerJoin(programs, eq(roles.programId, programs.id))
      .where(eq(roles.adminUserId, id));
    return { id, type, slug, permissions };
  }
  if (type === 'company') {
    const [company] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(eq(users.id, id), eq(users.slug, slug), eq(users.status, 'active')),
      )
      .limit(1);
    return company ? { id, type, slug, permissions: [] } : null;
  }
  const [debitor] = await db
    .select({ id: debitors.id })
    .from(debitors)
    .innerJoin(users, eq(debitors.userId, users.id))
    .where(and(eq(debitors.id, id), eq(users.slug, slug)))
    .limit(1);
  return debitor ? { id, type, slug, permissions: [] } : null;
}

export const authRepository = { findAccount, resolveIdentity };
