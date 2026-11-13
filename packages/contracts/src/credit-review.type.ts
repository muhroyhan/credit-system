import { z } from 'zod';
import { creditApplicationSchema } from './credit.type';

export const creditReviewSchema = z.strictObject({
  id: z.number().int().positive(),
  statusAdminApproval: z.enum(['approved', 'rejected', 'completed']),
  jumlahPengajuan: creditApplicationSchema.shape.jumlahPengajuan,
  jangkaWaktuBulan: z.number().int().positive(),
  biayaAsuransiJiwa: z.number().finite().nonnegative(),
});
export type CreditReview = z.infer<typeof creditReviewSchema>;
