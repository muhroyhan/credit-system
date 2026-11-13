import { adminInputSchema, adminRoleSchema } from '@credit/contracts';
import { z } from 'zod';

export const adminSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  isActive: z.boolean().nullable(),
  roles: z
    .array(
      z.object({
        programId: z.number(),
        value: adminRoleSchema.shape.value,
      }),
    )
    .optional(),
});

export const adminListSchema = z.object({
  count: z.number(),
  data: z.array(adminSchema),
});
export type AdminInput = z.infer<typeof adminInputSchema>;
export type Admin = z.infer<typeof adminSchema>;
export type AdminList = z.infer<typeof adminListSchema>;
export interface AdminUserFormProps {
  token: string;
  id?: number;
  initial?: AdminInput;
}

export const adminFormSchema = (editing: boolean) =>
  adminInputSchema
    .extend({
      password: z.union([z.literal(''), z.string().min(8).max(72)]).optional(),
    })
    .superRefine((value, ctx) => {
      if (!editing && !value.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Password wajib',
        });
      }
    });
