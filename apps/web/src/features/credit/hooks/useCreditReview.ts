import { useQuery } from '@tanstack/react-query';
import { detailReview } from '@web/features/credit/credit.api';
export function useCreditReview(token: string, id: number) {
  return useQuery({
    queryKey: ['credit-reviews', token, 'detail', id],
    queryFn: () => detailReview(token, id),
    enabled: id > 0 && Number.isInteger(id),
  });
}
