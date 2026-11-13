import {
  exportReviews,
  listReviews,
} from '@web/features/credit-review/credit-review.api';
import { useListing } from '@web/hooks/useListing';

export function useCreditReviews(token: string) {
  return useListing({
    initialQueries: {
      page: 1,
      limit: 20,
      nama: undefined as string | undefined,
      status: 'approved',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      userId: undefined as string | undefined,
      debitorId: undefined as string | undefined,
      statusAdminApproval: undefined as string | undefined,
    },
    queryKey: ['credit-reviews', token],
    load: (queries) => listReviews(token, queries),
    exportFile: (queries, format) => exportReviews(token, queries, format),
  });
}
