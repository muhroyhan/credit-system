import { useQuery } from '@tanstack/react-query';
import { adminDetail } from '@web/features/admin-users/admin-users.api';

export function useAdminDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['admin-users', token, 'detail', id],
    queryFn: () => adminDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
