import { z } from 'zod';

export const referenceItemSchema = z.object({
  id: z.number(),
  value: z.string().nullable(),
});
export const programSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  abbreviation: z.string().nullable(),
});
export const countrySchema = referenceItemSchema.extend({
  code: z.string().nullable(),
});
export const constantSchema = referenceItemSchema.extend({
  name: z.string().nullable(),
  type: z.string().nullable(),
});
export const slugSchema = z.object({
  id: z.number(),
  slug: z.string().nullable(),
  companyName: z.string().nullable(),
});
export const constantsQuerySchema = z.object({ name: z.string().optional() });

export const loginSchema = z
  .object({
    type: z.enum(['admin', 'company', 'debitor']),
    username: z.string().min(1),
    password: z.string().min(1),
    slug: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type !== 'admin' && !v.slug) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'Slug wajib diisi',
      });
    }
  });

export const adminRoleSchema = z.object({
  programId: z.number().int().positive(),
  value: z.enum(['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVAL']),
});
export const adminInputSchema = z.object({
  username: z.string().min(1).max(255),
  email: z.email().max(255),
  password: z.string().min(8).max(72).optional(),
  isActive: z.boolean(),
  roles: z
    .array(adminRoleSchema)
    .refine(
      (items) =>
        new Set(items.map((item) => `${item.programId}:${item.value}`)).size ===
        items.length,
      'Izin program harus unik',
    ),
});
export const adminCreateSchema = adminInputSchema.refine(
  (input) => !!input.password,
  { path: ['password'], message: 'Password wajib' },
);
export const adminUpdateSchema = adminInputSchema.extend({
  id: z.number().int().positive(),
});
export const adminDeleteSchema = z.object({ id: z.number().int().positive() });
export const adminListQuerySchema = z.object({
  sortBy: z
    .enum(['createdAt', 'username', 'email', 'isActive'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  email: z.string().optional(),
  username: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idQuerySchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const adminRoleDtoSchema = z.object({
  programId: z.number().nullable(),
  value: z.string().nullable(),
});
export const adminUserDtoSchema = z.object({
  id: z.number(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  isActive: z.boolean().nullable(),
  roles: z.array(adminRoleDtoSchema),
});
export const adminListDtoSchema = z.object({
  count: z.number(),
  data: z.array(adminUserDtoSchema),
});

export const companyInterestSchema = z.object({
  id: z.number().int().positive().optional(),
  bungaPercentage: z
    .string()
    .min(1)
    .max(255)
    .refine(
      (v) => Number.isFinite(Number(v)) && Number(v) >= 0,
      'Bunga tidak valid',
    ),
  jangkaWaktuBulan: z
    .string()
    .min(1)
    .max(255)
    .refine(
      (v) => Number.isInteger(Number(v)) && Number(v) > 0,
      'Tenor tidak valid',
    ),
});
export const companyExpenseSchema = z.object({
  id: z.number().int().positive().optional(),
  expenseType: z.string().min(1).max(255),
  type: z.string().min(1).max(255),
  value: z.number().int().min(0).max(2147483647),
});
export const companyInputSchema = z.object({
  entityTypeId: z.number().int().positive(),
  companyName: z.string().min(1).max(255),
  email: z.email().max(255),
  username: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['active', 'inactive', 'blocked']),
  password: z.string().min(8).max(72).optional(),
  bungaKredits: z.array(companyInterestSchema),
  biaya: z.array(companyExpenseSchema),
});
export const companyCreateSchema = companyInputSchema.refine(
  (v) => !!v.password,
  { path: ['password'], message: 'Password wajib' },
);
export const companyUpdateSchema = companyInputSchema.extend({
  id: z.number().int().positive(),
});
export const companyQuerySchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  companyName: z.string().optional(),
  entityTypeId: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(['companyName', 'username', 'email', 'status', 'createdAt'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export * from './employees.type';
