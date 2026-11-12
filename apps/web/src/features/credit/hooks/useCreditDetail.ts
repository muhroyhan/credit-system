import { useQuery } from '@tanstack/react-query';
import { detailCredit } from '@web/features/credit/credit.api';
export function useCreditDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['credits', token, 'detail', id],
    queryFn: () => detailCredit(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
