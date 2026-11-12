import type { Identity } from "@server/constant/interface";
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

export interface AuthRepository {
  findAccount: AccountLookup;
  resolveIdentity: IdentityResolver;
}

export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "APPROVAL";
