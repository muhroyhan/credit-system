import {
  CompanyStatusEnum,
  companyExpenseSchema,
  companyInputSchema,
  companyInterestSchema,
  type companyQuerySchema,
  referenceItemSchema,
} from '@credit/contracts';
import { z } from 'zod';

export const companySchema = z.object({
  id: z.number(),
  entityTypeId: z.number().nullable(),
  companyName: z.string().nullable(),
  email: z.string().nullable(),
  username: z.string().nullable(),
  slug: z.string().nullable(),
  status: z.enum(CompanyStatusEnum).nullable(),
  entityType: z.string().nullable().optional(),
});
export const companyDetailSchema = companySchema.extend({
  bungaKredits: z.array(companyInterestSchema),
  biaya: z.array(companyExpenseSchema),
});
export const companyListSchema = z.object({
  count: z.number(),
  data: z.array(companySchema),
});
export const companyFormSchema = (editing: boolean) =>
  companyInputSchema
    .extend({
      password: z.union([z.literal(''), z.string().min(8).max(72)]).optional(),
    })
    .superRefine((v, ctx) => {
      if (!editing && !v.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Password wajib',
        });
      }
    });
export const entityListSchema = referenceItemSchema.array();
export type CompanyInput = z.infer<typeof companyInputSchema>;
export type CompanyDetail = z.infer<typeof companyDetailSchema>;
export type CompanyQuery = z.input<typeof companyQuerySchema>;
export interface CompanyFormProps {
  token: string;
  id?: number;
  initial?: CompanyInput;
}
