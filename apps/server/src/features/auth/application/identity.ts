import { resolveIdentity } from "@server/features/auth/data/accounts";
import { verify } from "hono/jwt";
import { z } from "zod";

const claimsSchema = z.object({
  id: z.number().int().positive(),
  type: z.enum(["admin", "company", "debitor"]),
  slug: z.string().min(1),
  exp: z.number().int().positive(),
});
export async function authenticate(header?: string) {
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
export type Identity = NonNullable<Awaited<ReturnType<typeof authenticate>>>;
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
