import { z } from 'zod';
import { creditApplicationSchema } from './credit.type';
import { CreditStatusEnum } from './credit-status.enum';

export const creditReviewSchema = z.strictObject({
  id: z.number().int().positive(),
  statusAdminApproval: z.enum([
    CreditStatusEnum.Approved,
    CreditStatusEnum.Rejected,
    CreditStatusEnum.Completed,
  ]),
  jumlahPengajuan: creditApplicationSchema.shape.jumlahPengajuan,
  jangkaWaktuBulan: z.number().int().positive(),
  biayaAsuransiJiwa: z.number().finite().nonnegative(),
});
export type CreditReview = z.infer<typeof creditReviewSchema>;
