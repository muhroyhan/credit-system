import { AccountTypeEnum, PermissionActionEnum } from '@credit/contracts';
import type { CrudaAction, Session } from '@web/constant/type';

/** Maps the login role snapshot to UI actions; the API checks current permissions. */
export function crudaAccess(
  session: Session | null,
  program: string,
): Record<CrudaAction, boolean> {
  if (session && program === 'CGP' && session.type !== AccountTypeEnum.Admin) {
    return {
      create: session.type === AccountTypeEnum.Company,
      read: true,
      update: true,
      delete: session.type === AccountTypeEnum.Company,
      approve: session.type === AccountTypeEnum.Company,
    };
  }
  const roles: unknown = session?.userData.roles;
  const values =
    session?.type === AccountTypeEnum.Admin && Array.isArray(roles)
      ? roles
          .filter(
            (role): role is { program: string; value: string } =>
              typeof role === 'object' &&
              role !== null &&
              typeof role.program === 'string' &&
              typeof role.value === 'string',
          )
          .filter((role) => role.program === program)
          .map((role) => role.value)
      : [];
  return {
    create: values.includes(PermissionActionEnum.Create),
    read: values.includes(PermissionActionEnum.Read),
    update: values.includes(PermissionActionEnum.Update),
    delete: values.includes(PermissionActionEnum.Delete),
    approve: values.includes(PermissionActionEnum.Approval),
  };
}
