import {
  deleteAdmin,
  exportAdmins,
  listAdmins,
} from '@web/features/admin-users/admin-users.api';
import { useListing } from '@web/hooks/useListing';

export function useAdminUsers(token: string) {
  const { queries, setQueries, list, exporting, remove } = useListing({
    initialQueries: {
      search: undefined as string | undefined,
      page: 1,
      limit: 20,
      username: undefined as string | undefined,
      email: undefined as string | undefined,
      active: undefined as string | undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    queryKey: ['admin-users', token, 'list'],
    load: (queries) => listAdmins(token, queries),
    exportFile: (queries, format) => exportAdmins(token, queries, format),
    deleteRecord: (id) => deleteAdmin(token, id),
    invalidateKey: ['admin-users', token],
    detailKey: (id) => ['admin-users', token, 'detail', id],
  });
  return {
    rows: list.data?.data ?? [],
    total: list.data?.count ?? 0,
    queries,
    setQueries,
    loading: list.isFetching,
    deleting: remove.isPending,
    exporting: exporting.isPending,
    error: (remove.error ?? exporting.error ?? list.error)?.message ?? '',
    remove: remove.mutate,
    exportRows: exporting.mutate,
  };
}
