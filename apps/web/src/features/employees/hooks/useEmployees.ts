import {
  deleteEmployee,
  exportEmployees,
  listEmployees,
} from '@web/features/employees/employees.api';
import { useListing } from '@web/hooks/useListing';

export function useEmployees(token: string) {
  return useListing({
    initialQueries: {
      page: 1,
      limit: 20,
      namaLengkap: undefined as string | undefined,
      namaAlias: undefined as string | undefined,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    queryKey: ['employees', token, 'list'],
    load: (queries) => listEmployees(token, queries),
    exportFile: (queries, format) => exportEmployees(token, queries, format),
    deleteRecord: (id) => deleteEmployee(token, id),
    invalidateKey: ['employees'],
  });
}
