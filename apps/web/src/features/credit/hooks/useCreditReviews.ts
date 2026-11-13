import { useQuery } from '@tanstack/react-query';
import { listReviews } from '@web/features/credit/credit.api';
import { toSearchParams } from '@web/utils/search-params';
export function useCreditReviews(
  token: string,
  queries: Record<string, string | number | undefined>,
) {
  return useQuery({
    queryKey: ['credit-reviews', token, queries],
    queryFn: () => listReviews(token, toSearchParams(queries)),
  });
}
