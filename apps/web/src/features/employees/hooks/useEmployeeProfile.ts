import type { EmployeeProfile } from '@credit/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveProfile } from '@web/features/employees/employees.api';
import {
  type EmployeeDetail,
  employeeProfileSchema,
  emptyProfile,
} from '@web/features/employees/employees.type';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useEmployeeProfile(token: string, data: EmployeeDetail) {
  const client = useQueryClient();
  const form = useForm<EmployeeProfile>({
    resolver: zodResolver(employeeProfileSchema),
    mode: 'onTouched',
    defaultValues: { ...emptyProfile, ...data.profile },
  });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    if (!dirty) {
      form.reset({ ...emptyProfile, ...data.profile });
    }
  }, [data.profile, dirty, form]);
  const save = useMutation({
    mutationFn: (input: EmployeeProfile) => saveProfile(token, data.id, input),
    onSuccess: async (_result, input) => {
      await client.invalidateQueries({ queryKey: ['employees'] });
      form.reset(input);
    },
  });
  return { form, save };
}
