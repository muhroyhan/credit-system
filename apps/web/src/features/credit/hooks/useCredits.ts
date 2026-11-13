import { useMutation, useQuery } from '@tanstack/react-query';
import type { ExportFormat } from '@web/constant/type';
import { exportCredits, listCredits } from '@web/features/credit/credit.api';
import { useState } from 'react';
export function useCredits(token: string) {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const query = new URLSearchParams({
    page: String(page),
    limit: '20',
    sortBy,
    sortDirection,
  });
  if (name) {
    query.set('nama', name);
  }
  if (status) {
    query.set('status', status);
  }
  const list = useQuery({
    queryKey: ['credits', token, query.toString()],
    queryFn: () => listCredits(token, query),
  });
  const exporting = useMutation({
    mutationFn: (format: ExportFormat) => exportCredits(token, query, format),
  });
  return {
    page,
    setPage,
    name,
    setName,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    list,
    exporting,
  };
}
