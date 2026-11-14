import { useMutation } from '@tanstack/react-query';
import {
  exportCredits,
  exportCreditZip,
  listCredits,
} from '@web/features/credit/credit.api';
import { useListing } from '@web/hooks/useListing';
import { toSearchParams } from '@web/utils/search-params';

export function useCredits(token: string) {
  const listing = useListing({
    initialQueries: {
      search: undefined as string | undefined,
      page: 1,
      limit: 20,
      nama: undefined as string | undefined,
      status: undefined as string | undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    queryKey: ['credits', token],
    load: (queries) => listCredits(token, queries),
    exportFile: (queries, format) => exportCredits(token, queries, format),
  });
  const zip = useMutation({
    mutationFn: () => exportCreditZip(token, toSearchParams(listing.queries)),
  });
  return { ...listing, zip };
}
