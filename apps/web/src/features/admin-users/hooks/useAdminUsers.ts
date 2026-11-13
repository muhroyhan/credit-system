import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  deleteAdmin,
  exportAdmins,
  listAdmins,
} from '@web/features/admin-users/admin-users.api';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';
export function useAdminUsers(token: string) {
  const client = useQueryClient();
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    username: undefined as string | undefined,
    email: undefined as string | undefined,
    active: undefined as string | undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const list = useQuery({
    queryKey: ['admin-users', token, 'list', queries],
    queryFn: () => listAdmins(token, toSearchParams(queries)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteAdmin(token, id),
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: ['admin-users', token, 'detail', id] });
      if (list.data?.data.length === 1) {
        setQueries((current) => ({
          ...current,
          page: Math.max(1, current.page - 1),
        }));
      }
      await client.invalidateQueries({ queryKey: ['admin-users', token] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      exportAdmins(token, toSearchParams(queries), format),
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
