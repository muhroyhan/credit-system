import { useQuery } from '@tanstack/react-query';
import { listReviews } from '@web/features/credit/credit.api';
export function useCreditReviews(token: string, query: URLSearchParams) {
  return useQuery({
    queryKey: ['credit-reviews', token, query.toString()],
    queryFn: () => listReviews(token, query),
  });
}
