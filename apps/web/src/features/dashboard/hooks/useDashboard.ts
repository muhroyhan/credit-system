import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@web/features/dashboard/dashboard.api';
export function useDashboard(token: string) {
  return useQuery({
    queryKey: ['dashboard', token],
    queryFn: () => getDashboard(token),
  });
}
