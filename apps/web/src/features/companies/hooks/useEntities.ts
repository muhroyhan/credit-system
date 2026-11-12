import { useQuery } from '@tanstack/react-query';
import { entities } from '@web/features/companies/companies.api';

export function useEntities(token: string) {
  return useQuery({
    queryKey: ['entities', token],
    queryFn: () => entities(token),
  });
}
