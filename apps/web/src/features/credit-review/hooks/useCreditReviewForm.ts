import { type CreditReview, creditReviewSchema } from '@credit/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveReview } from '@web/features/credit-review/credit-review.api';
import type { CreditReviewDetail } from '@web/features/credit-review/credit-review.type';
import { useForm } from 'react-hook-form';
export function useCreditReviewForm(
  token: string,
  row: CreditReviewDetail,
  onResult: (notification: string) => void,
) {
  const client = useQueryClient();
  const form = useForm<CreditReview>({
    resolver: zodResolver(creditReviewSchema),
    defaultValues: {
      id: row.credit.id,
      jumlahPengajuan: row.credit.jumlahPengajuan ?? '',
      jangkaWaktuBulan: row.credit.jangkaWaktuBulan ?? 0,
      biayaAsuransiJiwa: row.credit.biayaAsuransiJiwa ?? 0,
      statusAdminApproval:
        row.credit.statusAdminApproval === 'approved'
          ? 'completed'
          : 'approved',
    },
  });
  const save = useMutation({
    mutationFn: (value: CreditReview) => saveReview(token, value),
    onSuccess: async (result) => {
      onResult(result.notification);
      await client.invalidateQueries({ queryKey: ['credit-reviews'] });
      await client.invalidateQueries({ queryKey: ['credits'] });
    },
  });
  return { form, save };
}
