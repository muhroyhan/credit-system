import { z } from 'zod';
import { employeeDocumentKinds } from './employees.constant';

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

const requiredText = z.string().trim().min(1, 'Wajib diisi').max(255);
export const employeeProfileSchema = z
  .object({
    employeeId: requiredText,
    noKtp: requiredText,
    namaLengkap: requiredText,
    jenisKelamin: requiredText,
    agama: requiredText,
    tempatLahir: requiredText,
    tanggalLahir: z.iso.date(),
    statusMarital: requiredText,
    namaIbuKandung: requiredText,
    alamatKtp: requiredText,
    provinsi: requiredText,
    kota: requiredText,
    kecamatan: requiredText,
    kelurahanDesa: requiredText,
    kodePos: requiredText,
    alamatDomisili: requiredText,
    namaAlias: z.string().max(255),
    noHp: z.string().max(255),
    noTelp: z.string().max(255),
    pekerjaan: z.string().max(255),
    pendidikan: z.string().max(255),
    kewarganegaraan: z.string().max(255),
    npwp: z.string().max(255),
    takehomePay: z
      .string()
      .regex(/^\d+$/, 'Pendapatan harus berupa angka')
      .refine(
        (v) => Number(v) <= 4294967295,
        'Pendapatan melebihi batas integer',
      ),
  })
  .strict();
export const employeeProfileUpdateSchema = z
  .object({ id: z.number().int().positive(), profile: employeeProfileSchema })
  .strict();

export const employeeDocumentKindSchema = z.enum(employeeDocumentKinds);
export const employeeDetailSchema = employeeRowSchema.extend({
  profile: employeeProfileSchema.partial(),
  documents: z.record(employeeDocumentKindSchema, z.string().nullable()),
});
export type EmployeeProfile = z.infer<typeof employeeProfileSchema>;
export type EmployeeDocumentKind = z.infer<typeof employeeDocumentKindSchema>;
