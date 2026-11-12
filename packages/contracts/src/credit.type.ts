import { z } from 'zod';

const amount = z
  .string()
  .trim()
  .regex(/^(?:\d+|\d{1,3}(?:\.\d{3})+)$/);
const calendarDate = z.iso.date();

const optionalText = z.string().max(255).nullable().optional();
const optionalInteger = z
  .number()
  .int()
  .min(-2147483648)
  .max(2147483647)
  .nullable()
  .optional();
const collectionSchema = z.strictObject({
  biJenisPenggunaan: optionalText,
  biSifatPinjaman: optionalText,
  golonganDebitur: optionalText,
  jenisUsaha: optionalText,
  kodeGroup4: optionalText,
  kodeGroup5: optionalText,
  namaKolektor: optionalText,
  namaMarketing: optionalText,
  namaWilayah: optionalText,
  periodePembayaran: optionalText,
  periodePembayaranBunga: optionalText,
  sandiPenjamin: optionalText,
  sumberPelunasan: optionalText,
  persenPenjamin: optionalInteger,
});
const guarantorSchema = z.strictObject({
  alamat: optionalText,
  hubungan: optionalText,
  kodeGolonganPenjamin: optionalText,
  kodeIdentitasPenjamin: optionalText,
  nama: optionalText,
  noId: optionalText,
  npwp: optionalText,
  pekerjaan: optionalText,
  keterangan: optionalText,
  persentasePenjamin: optionalInteger,
});
const slikBmpkSchema = z.strictObject({
  akadPembiayaan: optionalText,
  caraRestrukturisasi: optionalText,
  hubunganKeterkaitan: optionalText,
  jenisKredit: optionalText,
  jenisPenggunaan: optionalText,
  jenisSukuBunga: optionalText,
  kategoriDebitur: optionalText,
  kelompokDebitur: optionalText,
  kodeKeterkaitan: optionalText,
  kodeKondisi: optionalText,
  kodeProgramPemerintah: optionalText,
  kotaKabPenggunaan: optionalText,
  noRekeningSlik: optionalText,
  orientasiPenggunaan: optionalText,
  penyediaanDana: optionalText,
  sandiBank: optionalText,
  sebabMacet: optionalText,
  sektorEkonomi: optionalText,
  sifatKredit: optionalText,
  sumberDana: optionalText,
  valuta: optionalText,
  keterangan: optionalText,
});
const spouseSchema = z.strictObject({
  status: optionalText,
});

export const creditApplicationSchema = z.strictObject({
  debitorId: z.number().int().positive(),
  jumlahPengajuan: amount,
  jangkaWaktuBulan: z.number().int().positive(),
  tanggalPengajuan: calendarDate,
  collection: collectionSchema.optional(),
  guarantor: guarantorSchema.optional(),
  slikBmpk: slikBmpkSchema.optional(),
  spouse: spouseSchema.optional(),
});

export const creditUpdateSchema = creditApplicationSchema.extend({
  id: z.number().int().positive(),
});

export const creditQuerySchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  debitorId: z.coerce.number().int().positive().optional(),
  nama: z.string().max(255).optional(),
  noKtp: z.string().max(255).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
  statusAdminApproval: z
    .enum(['pending', 'approved', 'rejected', 'completed'])
    .optional(),
  createdFrom: calendarDate.optional(),
  createdTo: calendarDate.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z
    .enum(['id', 'createdAt', 'tanggalPengajuan', 'jumlahPengajuan'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export type CreditApplication = z.infer<typeof creditApplicationSchema>;
export type CreditQuery = z.infer<typeof creditQuerySchema>;
