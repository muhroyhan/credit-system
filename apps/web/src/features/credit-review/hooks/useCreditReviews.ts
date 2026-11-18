import { useMutation } from '@tanstack/react-query';
import {
  exportReviews,
  exportReviewZip,
  listReviews,
} from '@web/features/credit-review/credit-review.api';
import { useListing } from '@web/hooks/useListing';
import { toSearchParams } from '@web/utils/search-params';

export function useCreditReviews(token: string) {
  const listing = useListing({
    initialQueries: {
      search: undefined as string | undefined,
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
  const zip = useMutation({
    mutationFn: () => exportReviewZip(token, toSearchParams(listing.queries)),
  });
  return { ...listing, zip };
}
