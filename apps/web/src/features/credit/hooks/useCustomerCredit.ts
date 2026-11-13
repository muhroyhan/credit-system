import { creditConfirmationSchema } from '@credit/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelCredit,
  confirmCredit,
  creditStatus,
} from '@web/features/credit/credit.api';
import {
  type CreditConfirmationForm,
  creditConfirmationFormSchema,
} from '@web/features/credit/credit.type';
import { useForm } from 'react-hook-form';

export function useCustomerCredit(token: string, id: number) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['credits', token, 'status', id],
    queryFn: () => creditStatus(token, id),
    enabled: Number.isInteger(id) && id > 0,
  });
  const form = useForm<CreditConfirmationForm>({
    resolver: zodResolver(creditConfirmationFormSchema),
    defaultValues: {
      bankName: '',
      bankBranch: '',
      bankAccountName: '',
      bankAccountNumber: '',
      confirmationName: '',
      confirmed: false,
    },
  });
  async function refresh() {
    await client.invalidateQueries({ queryKey: ['credits'] });
  }
  const cancel = useMutation({
    mutationFn: () => cancelCredit(token, id),
    onSuccess: refresh,
  });
  const confirm = useMutation({
    mutationFn: (values: CreditConfirmationForm) =>
      confirmCredit(token, creditConfirmationSchema.parse({ ...values, id })),
    onSuccess: refresh,
  });
  return { query, form, cancel, confirm };
}
