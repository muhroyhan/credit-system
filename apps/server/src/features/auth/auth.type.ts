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

export type LoginInput = {
  type: "admin" | "company" | "debitor";
  username: string;
  password: string;
  slug?: string;
};
export type AuthEnv = { Variables: { identity: Identity } };
