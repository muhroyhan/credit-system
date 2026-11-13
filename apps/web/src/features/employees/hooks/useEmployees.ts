import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  deleteEmployee,
  exportEmployees,
  listEmployees,
} from '@web/features/employees/employees.api';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';

export function useEmployees(token: string) {
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    namaLengkap: undefined as string | undefined,
    namaAlias: undefined as string | undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const list = useQuery({
    queryKey: ['employees', token, 'list', queries],
    queryFn: () => listEmployees(token, toSearchParams(queries)),
  });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => deleteEmployee(token, id),
    onSuccess: async () => {
      if (list.data?.data.length === 1) {
        setQueries((current) => ({
          ...current,
          page: Math.max(1, current.page - 1),
        }));
      }
      await client.invalidateQueries({ queryKey: ['employees'] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      exportEmployees(token, toSearchParams(queries), format),
  });
  return { list, queries, setQueries, remove, exporting };
}
