import { useQuery } from '@tanstack/react-query';
import { employeeDetail } from '@web/features/employees/employees.api';

export function useEmployeeDetail(token: string, id: number) {
  return useQuery({
    queryKey: ['employees', token, 'detail', id],
    queryFn: () => employeeDetail(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
