import { findAccount } from "@server/features/auth/data/accounts";
import { sign } from "hono/jwt";
export async function login(input: {
  type: "admin" | "company" | "debitor";
  username: string;
  password: string;
  slug?: string;
}) {
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
