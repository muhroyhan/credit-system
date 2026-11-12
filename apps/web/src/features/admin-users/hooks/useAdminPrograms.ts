import { useQuery } from '@tanstack/react-query';
import { programs } from '@web/features/admin-users/admin-users.api';

export function useAdminPrograms(token: string) {
  return useQuery({
    queryKey: ['programs', token],
    queryFn: () => programs(token),
  });
}
