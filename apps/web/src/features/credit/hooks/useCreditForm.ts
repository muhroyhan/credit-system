import {
  type CreditApplication,
  creditApplicationSchema,
} from '@credit/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  creditRates,
  saveCredit,
  simulateCredit,
} from '@web/features/credit/credit.api';
import type { CreditRow } from '@web/features/credit/credit.type';
import { useForm } from 'react-hook-form';
export function useCreditForm(
  token: string,
  debitorId: number,
  row?: CreditRow,
) {
  const form = useForm<CreditApplication>({
    resolver: zodResolver(creditApplicationSchema),
    defaultValues: {
      debitorId: row?.credit.debitorId ?? debitorId,
      jumlahPengajuan: row?.credit.jumlahPengajuan ?? '',
      jangkaWaktuBulan: row?.credit.jangkaWaktuBulan ?? 0,
      tanggalPengajuan:
        row?.credit.tanggalPengajuan ?? new Date().toLocaleDateString('en-CA'),
    },
  });
  const client = useQueryClient();
  const navigate = useNavigate();
  const save = useMutation({
    mutationFn: (input: CreditApplication) =>
      saveCredit(token, input, row?.credit.id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['credits'] });
      await navigate({ to: '/credits' });
    },
  });
  const simulation = useMutation({
    mutationFn: (input: CreditApplication) => simulateCredit(token, input),
  });
  const selectedDebitor = form.watch('debitorId');
  const rates = useQuery({
    queryKey: ['credits', token, 'rates', selectedDebitor],
    queryFn: () => creditRates(token, selectedDebitor),
    enabled: selectedDebitor > 0,
  });
  return { form, save, simulation, rates };
}
