import type { Session } from "@web/features/auth/auth.api";
export type CrudaAction = "create" | "read" | "update" | "delete" | "approve";
export function crudaAccess(
  session: Session | null,
  program: string,
): Record<CrudaAction, boolean> {
  const roles: unknown = session?.userData.roles;
  const values =
    session?.type === "admin" && Array.isArray(roles)
      ? roles
          .filter(
            (role): role is { program: string; value: string } =>
              typeof role === "object" &&
              role !== null &&
              typeof role.program === "string" &&
              typeof role.value === "string",
          )
          .filter((role) => role.program === program)
          .map((role) => role.value)
      : [];
  const write = values.includes("WRITE");
  return {
    create: write,
    read: write || values.includes("READ"),
    update: write,
    delete: write,
    approve: false,
  };
}
