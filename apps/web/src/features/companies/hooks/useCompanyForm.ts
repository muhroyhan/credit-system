import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { saveCompany } from '@web/features/companies/companies.api';
import {
  type CompanyInput,
  companyFormSchema,
} from '@web/features/companies/companies.type';
import { useForm } from 'react-hook-form';

export function useCompanyForm(
  token: string,
  id?: number,
  initial?: CompanyInput,
) {
  const form = useForm<CompanyInput>({
    resolver: zodResolver(companyFormSchema(!!id)),
    mode: 'onTouched',
    defaultValues: initial ?? {
      entityTypeId: 0,
      companyName: '',
      username: '',
      email: '',
      slug: '',
      password: '',
      status: 'active',
      bungaKredits: [],
      biaya: [],
    },
  });
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: (input: CompanyInput) =>
      saveCompany(
        token,
        { ...input, password: input.password || undefined },
        id,
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['companies', token] });
      await client.invalidateQueries({ queryKey: ['companies'] });
      await navigate({ to: '/companies' });
    },
  });
  return { form, save };
}
