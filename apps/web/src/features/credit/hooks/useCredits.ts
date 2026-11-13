import { useMutation, useQuery } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import { exportCredits, listCredits } from '@web/features/credit/credit.api';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';
export function useCredits(token: string) {
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    nama: undefined as string | undefined,
    status: undefined as string | undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const list = useQuery({
    queryKey: ['credits', token, queries],
    queryFn: () => listCredits(token, toSearchParams(queries)),
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      exportCredits(token, toSearchParams(queries), format),
  });
  return { queries, setQueries, list, exporting };
}
