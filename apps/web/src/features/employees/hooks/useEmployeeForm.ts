import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getSlugs } from '@web/features/auth/auth.api';
import { useSession } from '@web/features/auth/hooks/useSession';
import { saveEmployee } from '@web/features/employees/employees.api';
import {
  accountFormSchema,
  type EmployeeFormInput,
  type EmployeePageProps,
} from '@web/features/employees/employees.type';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
export function useEmployeeForm({ token, id, initial }: EmployeePageProps) {
  const { session } = useSession();
  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(accountFormSchema(!!id, session?.type === 'admin')),
    mode: 'onTouched',
    defaultValues: {
      namaLengkap: initial?.namaLengkap ?? '',
      username: initial?.username ?? '',
      password: '',
      userId: initial?.userId ?? undefined,
    },
  });
  const dirty = form.formState.isDirty;
  useEffect(() => {
    if (initial && !dirty) {
      form.reset({
        namaLengkap: initial.namaLengkap ?? '',
        username: initial.username ?? '',
        password: '',
        userId: initial.userId ?? undefined,
      });
    }
  }, [initial, dirty, form]);
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: (input: EmployeeFormInput) => saveEmployee(token, input, id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['employees'] });
      form.reset({ ...form.getValues(), password: '' });
      if (!id) {
        await navigate({ to: '/employees' });
      }
    },
  });
  const companies = useQuery({ queryKey: ['slugs'], queryFn: getSlugs });
  return { form, save, companies };
}
