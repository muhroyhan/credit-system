import { exportCredits, listCredits } from '@web/features/credit/credit.api';
import { useListing } from '@web/hooks/useListing';

export function useCredits(token: string) {
  return useListing({
    initialQueries: {
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
}
