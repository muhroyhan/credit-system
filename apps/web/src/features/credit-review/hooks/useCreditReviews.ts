import { useMutation, useQuery } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import {
  exportReviews,
  listReviews,
} from '@web/features/credit-review/credit-review.api';
import { toSearchParams } from '@web/utils/search-params';
import { useState } from 'react';
export function useCreditReviews(token: string) {
  const [queries, setQueries] = useState({
    page: 1,
    limit: 20,
    nama: undefined as string | undefined,
    status: 'approved',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    userId: undefined as string | undefined,
    debitorId: undefined as string | undefined,
    statusAdminApproval: undefined as string | undefined,
  });
  const list = useQuery({
    queryKey: ['credit-reviews', token, queries],
    queryFn: () => listReviews(token, toSearchParams(queries)),
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) =>
      exportReviews(token, toSearchParams(queries), format),
  });
  return { queries, setQueries, list, exporting };
}
