import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '@web/features/auth/hooks/useSession';
import { registerEmployee } from '@web/features/employees/employees.api';
import {
  type RegistrationInput,
  registrationSchema,
} from '@web/features/employees/employees.type';
import { useForm } from 'react-hook-form';
export function useRegistration(slug: string) {
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onTouched',
    defaultValues: {
      namaLengkap: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });
  const { login, error: loginError } = useSession();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: (input: RegistrationInput) => registerEmployee(slug, input),
    onSuccess: (_data, input) =>
      login(
        {
          type: 'debitor',
          username: input.username,
          password: input.password,
          slug,
        },
        {
          onSuccess: (data) => {
            void navigate({
              to: '/employees/$id/edit',
              params: { id: String(data.userData.id) },
            });
          },
        },
      ),
  });
  return { form, save, loginError };
}
