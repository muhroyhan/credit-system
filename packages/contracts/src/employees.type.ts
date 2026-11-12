import { z } from 'zod';

export const employeeAccountSchema = z
  .object({
    namaLengkap: z.string().trim().min(1).max(255),
    username: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[a-zA-Z0-9._-]+$/),
    password: z
      .string()
      .min(8)
      .max(72)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/,
        'Password memerlukan huruf besar, kecil dan angka',
      ),
  })
  .strict();
export const employeeRegisterSchema = employeeAccountSchema.extend({
  slug: z.string().min(1).max(255),
});
export const employeeCreateSchema = employeeAccountSchema.extend({
  userId: z.number().int().positive().optional(),
});
export const employeeUpdateSchema = employeeAccountSchema
  .partial({ password: true })
  .extend({ id: z.number().int().positive() });
export const employeeQuerySchema = z.object({
  namaLengkap: z.string().max(255).optional(),
  namaAlias: z.string().max(255).optional(),
  userId: z.coerce.number().int().positive().optional(),
  sortBy: z
    .enum(['id', 'employeeId', 'namaLengkap', 'createdAt'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const employeeRowSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  username: z.string().nullable(),
  namaLengkap: z.string().nullable(),
  namaAlias: z.string().nullable(),
  employeeId: z.string().nullable(),
  noKtp: z.string().nullable(),
  companyName: z.string().nullable(),
});
export const employeeListSchema = z.object({
  count: z.number(),
  data: z.array(employeeRowSchema),
});
export type EmployeeAccount = z.infer<typeof employeeAccountSchema>;
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;
