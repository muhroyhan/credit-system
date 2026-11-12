import type { Identity } from '@server/constant/interface';
import { aclSchema } from '@server/constant/schema';
import { authRepository } from '@server/features/auth/auth.repository';
import type {
  AccountLookup,
  IdentityResolver,
  LoginInput,
  PermissionAction,
} from '@server/features/auth/auth.type';
import { withTransaction } from '@server/utils/transaction';
import { sign, verify } from 'hono/jwt';
import { z } from 'zod';

export type { Identity } from '@server/constant/interface';

const claimsSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(['admin', 'company', 'debitor']),
  slug: z.string().min(1),
  exp: z.number().int().positive(),
});
export async function authenticate(
  header: string | undefined,
  resolveIdentity: IdentityResolver,
) {
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  let payload: unknown;
  try {
    payload = await verify(header.slice(7), secret, 'HS256');
  } catch {
    return null;
  }
  const claims = claimsSchema.safeParse(payload);
  if (!claims.success || claims.data.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }
  return resolveIdentity(claims.data.type, claims.data.id, claims.data.slug);
}
export function hasAclPermission(identity: Identity, acl: string) {
  const parsed = aclSchema.safeParse(acl);
  if (!parsed.success || identity.type !== 'admin') {
    return false;
  }
  const [program, action] = parsed.data.split('_');
  return identity.permissions.some(
    (p) => p.program === program && p.value === action,
  );
}
export function hasProgramPermission(
  identity: Identity,
  program: string,
  action: PermissionAction,
) {
  return hasAclPermission(identity, `${program}_${action}`);
}
export function belongsToCompany(identity: Identity, slug: string) {
  return identity.type === 'admin' || identity.slug === slug;
}

export async function login(input: LoginInput, findAccount: AccountLookup) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  const account = await findAccount(input.type, input.username, input.slug);
  if (
    !account?.password ||
    !(await Bun.password.verify(input.password, account.password, 'bcrypt'))
  ) {
    return null;
  }
  const authToken = await sign(
    {
      id: account.id,
      slug: account.slug,
      type: input.type,
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
    secret,
    'HS256',
  );
  return { authToken, type: input.type, userData: account.userData };
}

export const authService = {
  login: (input: LoginInput) =>
    withTransaction((tx) =>
      login(input, (type, username, slug) =>
        authRepository.findAccount(type, username, slug, tx),
      ),
    ),
  authenticate: (header?: string) =>
    authenticate(header, authRepository.resolveIdentity),
  hasAclPermission,
  hasProgramPermission,
  belongsToCompany,
};
