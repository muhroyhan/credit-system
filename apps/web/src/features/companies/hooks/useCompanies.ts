import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  deleteCompany,
  exportCompanies,
  listCompanies,
} from '@web/features/companies/companies.api';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';

export function useCompanies(token: string) {
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    companyName: undefined as string | undefined,
    username: undefined as string | undefined,
    email: undefined as string | undefined,
    status: undefined as string | undefined,
    entityTypeId: undefined as string | undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const list = useQuery({
    queryKey: ['companies', token, 'list', queries],
    queryFn: () => listCompanies(token, toSearchParams(queries)),
  });
  const client = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => deleteCompany(token, id),
    onSuccess: async () => {
      if (list.data?.data.length === 1) {
        setQueries((current) => ({
          ...current,
          page: Math.max(1, current.page - 1),
        }));
      }
      await client.invalidateQueries({ queryKey: ['companies'] });
    },
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      exportCompanies(token, toSearchParams(queries), format),
  });
  return { list, queries, setQueries, remove, exporting };
}
