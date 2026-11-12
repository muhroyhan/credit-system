import { verify } from "hono/jwt";
import { z } from "zod";

const claimsSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(["admin", "company", "debitor"]),
  slug: z.string().min(1),
  exp: z.number().int().positive(),
});
export type Identity = {
  id: number;
  type: "admin" | "company" | "debitor";
  slug: string;
  permissions: { program: string | null; value: string | null }[];
};
export type IdentityResolver = (
  type: Identity["type"],
  id: number,
  slug: string,
) => Promise<Identity | null>;
export async function authenticate(
  header: string | undefined,
  resolveIdentity: IdentityResolver,
) {
  if (!header?.startsWith("Bearer ")) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  let payload: unknown;
  try {
    payload = await verify(header.slice(7), secret, "HS256");
  } catch {
    return null;
  }
  const claims = claimsSchema.safeParse(payload);
  if (!claims.success || claims.data.exp <= Math.floor(Date.now() / 1000))
    return null;
  return resolveIdentity(claims.data.type, claims.data.id, claims.data.slug);
}
export function hasProgramPermission(
  identity: Identity,
  program: string,
  access: "READ" | "WRITE",
) {
  return (
    identity.type === "admin" &&
    identity.permissions.some(
      (p) =>
        p.program === program &&
        (p.value === access || (access === "READ" && p.value === "WRITE")),
    )
  );
}
export function belongsToCompany(identity: Identity, slug: string) {
  return identity.type === "admin" || identity.slug === slug;
}

import { sign } from "hono/jwt";

type Account = {
  id: number;
  slug: string;
  password: string | null;
  userData: Record<string, unknown>;
};
export type AccountLookup = (
  type: "admin" | "company" | "debitor",
  username: string,
  slug?: string,
) => Promise<Account | null>;
export async function login(
  input: {
    type: "admin" | "company" | "debitor";
    username: string;
    password: string;
    slug?: string;
  },
  findAccount: AccountLookup,
) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required");
  const account = await findAccount(input.type, input.username, input.slug);
  if (
    !account?.password ||
    !(await Bun.password.verify(input.password, account.password, "bcrypt"))
  )
    return null;
  const authToken = await sign(
    {
      id: account.id,
      slug: account.slug,
      type: input.type,
      exp: Math.floor(Date.now() / 1000) + 86400,
    },
    secret,
    "HS256",
  );
  return { authToken, type: input.type, userData: account.userData };
}

export const authService = {
  login,
  authenticate,
  hasProgramPermission,
  belongsToCompany,
};
