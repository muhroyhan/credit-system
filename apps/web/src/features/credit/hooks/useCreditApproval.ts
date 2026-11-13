import type { CreditApproval } from '@credit/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveCredit } from '@web/features/credit/credit.api';

export function useCreditApproval(token: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreditApproval) => approveCredit(token, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}
