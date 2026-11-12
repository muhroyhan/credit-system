import { zodResolver } from '@hookform/resolvers/zod';
import {
  type AdminInput,
  adminFormSchema,
} from '@web/features/admin-users/admin-users.type';
import { useForm } from 'react-hook-form';

export function useAdminForm(
  initial: AdminInput | undefined,
  editing: boolean,
) {
  return useForm<AdminInput>({
    resolver: zodResolver(adminFormSchema(editing)),
    mode: 'onTouched',
    defaultValues: initial ?? {
      username: '',
      email: '',
      password: '',
      isActive: true,
      roles: [],
    },
  });
}
