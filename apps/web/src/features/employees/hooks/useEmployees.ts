import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  deleteEmployee,
  employeeDetail,
  exportEmployees,
  listEmployees,
} from '@web/features/employees/employees.api';
import { useState } from 'react';
export function useEmployeeDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['employees', token, 'detail', id],
    queryFn: () => employeeDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
export function useEmployees(token: string) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    namaLengkap: '',
    namaAlias: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => !!v),
  );
  const list = useQuery({
    queryKey: ['employees', token, 'list', query.toString(), page],
    queryFn: () =>
      listEmployees(
        token,
        new URLSearchParams({
          ...Object.fromEntries(query),
          page: String(page),
          limit: '20',
        }),
      ),
  });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => deleteEmployee(token, id),
    onSuccess: async () => {
      if (page > 1 && list.data?.data.length === 1) {
        setPage(page - 1);
      }
      await client.invalidateQueries({ queryKey: ['employees'] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) => exportEmployees(token, query, format),
  });
  return {
    list,
    page,
    setPage,
    filters,
    filter: (key: keyof typeof filters, value: string) => {
      setFilters((v) => ({ ...v, [key]: value }));
      setPage(1);
    },
    remove,
    exporting,
  };
}
