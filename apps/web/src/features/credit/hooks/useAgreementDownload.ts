import { useMutation } from '@tanstack/react-query';
import { downloadAgreement } from '@web/features/credit/credit.api';
export function useAgreementDownload(token: string, id: number) {
  return useMutation({ mutationFn: () => downloadAgreement(token, id) });
}
