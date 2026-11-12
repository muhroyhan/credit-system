import { useQuery } from '@tanstack/react-query';
import { companyDetail } from '@web/features/companies/companies.api';

export function useCompanyDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['companies', token, 'detail', id],
    queryFn: () => companyDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
