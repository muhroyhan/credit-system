import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  deleteCompany,
  exportCompanies,
  listCompanies,
} from '@web/features/companies/companies.api';
import { useState } from 'react';

export function useCompanies(token: string) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    companyName: '',
    username: '',
    email: '',
    status: '',
    entityTypeId: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => !!v),
  );
  const list = useQuery({
    queryKey: ['companies', token, 'list', query.toString(), page],
    queryFn: () =>
      listCompanies(
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
    mutationFn: (id: number) => deleteCompany(token, id),
    onSuccess: async () => {
      if (list.data?.data.length === 1 && page > 1) {
        setPage(page - 1);
      }
      await client.invalidateQueries({ queryKey: ['companies'] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) => exportCompanies(token, query, format),
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
