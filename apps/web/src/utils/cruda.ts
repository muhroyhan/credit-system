import type { CrudaAction, Session } from '@web/constant/type';

/** Maps the login role snapshot to UI actions; the API checks current permissions. */
export function crudaAccess(
  session: Session | null,
  program: string,
): Record<CrudaAction, boolean> {
  const roles: unknown = session?.userData.roles;
  const values =
    session?.type === 'admin' && Array.isArray(roles)
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
    create: values.includes('CREATE'),
    read: values.includes('READ'),
    update: values.includes('UPDATE'),
    delete: values.includes('DELETE'),
    approve: values.includes('APPROVAL'),
  };
}
