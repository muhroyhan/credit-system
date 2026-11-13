import { creditRowSchema } from '@web/features/credit/credit.type';
import { z } from 'zod';

export const creditReviewDetailSchema = creditRowSchema.extend({
  noKtp: z.string().nullable(),
  summary: z.object({ open: z.number(), score: z.number() }).nullable(),
  expenses: z.array(
    z.object({
      id: z.number(),
      expenseName: z.string().nullable(),
      unit: z.string().nullable(),
      value: z.number().nullable(),
      amount: z.string().nullable(),
    }),
  ),
});
export const creditReviewResultSchema = z.object({
  id: z.number(),
  notification: z.enum(['sent', 'failed', 'not-required', 'not-configured']),
});
export type CreditReviewDetail = z.infer<typeof creditReviewDetailSchema>;
