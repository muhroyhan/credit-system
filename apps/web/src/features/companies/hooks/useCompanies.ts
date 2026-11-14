import {
  deleteCompany,
  exportCompanies,
  listCompanies,
} from '@web/features/companies/companies.api';
import { useListing } from '@web/hooks/useListing';

export function useCompanies(token: string) {
  return useListing({
    initialQueries: {
      search: undefined as string | undefined,
      page: 1,
      limit: 20,
      companyName: undefined as string | undefined,
      username: undefined as string | undefined,
      email: undefined as string | undefined,
      status: undefined as string | undefined,
      entityTypeId: undefined as string | undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    queryKey: ['companies', token, 'list'],
    load: (queries) => listCompanies(token, queries),
    exportFile: (queries, format) => exportCompanies(token, queries, format),
    deleteRecord: (id) => deleteCompany(token, id),
    invalidateKey: ['companies'],
  });
}
