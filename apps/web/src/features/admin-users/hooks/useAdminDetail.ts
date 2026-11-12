import { useQuery } from '@tanstack/react-query';
import {
  adminDetail,
  programs,
} from '@web/features/admin-users/admin-users.api';

export function useAdminDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['admin-users', token, 'detail', id],
    queryFn: () => adminDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
export function useAdminPrograms(token: string) {
  return useQuery({
    queryKey: ['programs', token],
    queryFn: () => programs(token),
  });
}
