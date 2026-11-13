import { z } from 'zod';

export const creditRowSchema = z.object({
  credit: z.object({
    id: z.number(),
    debitorId: z.number().nullable(),
    jumlahPengajuan: z.string().nullable(),
    jumlahAngsuran: z.string().nullable(),
    jangkaWaktuBulan: z.number().nullable(),
    tanggalPengajuan: z.string().nullable(),
    status: z.string().nullable(),
    statusAdminApproval: z.string().nullable(),
    biayaAsuransiJiwa: z.number().nullable().optional(),
    debitorAcknowledgmentTimestamp: z.string().nullable(),
  }),
  userId: z.number().nullable(),
  nama: z.string().nullable(),
  companyName: z.string().nullable(),
});
export const creditListSchema = z.object({
  count: z.number(),
  data: z.array(creditRowSchema),
});
export const creditSimulationSchema = z.object({
  principal: z.number(),
  months: z.number(),
  percentage: z.number(),
  installment: z.number(),
  total: z.number(),
  open: z.number(),
  score: z.number(),
});
export const creditRatesSchema = z.array(
  z.object({
    id: z.number(),
    jangkaWaktuBulan: z.string().nullable(),
    bungaPercentage: z.string().nullable(),
  }),
);
export type CreditRow = z.infer<typeof creditRowSchema>;

export const creditStatusSchema = creditRowSchema.extend({
  expenses: z.array(
    z.object({
      id: z.number(),
      expenseName: z.string().nullable(),
      amount: z.string().nullable(),
    }),
  ),
});
export const creditConfirmationFormSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank wajib diisi').max(255),
  bankBranch: z.string().trim().min(1, 'Cabang wajib diisi').max(255),
  bankAccountName: z
    .string()
    .trim()
    .min(1, 'Nama rekening wajib diisi')
    .max(255),
  bankAccountNumber: z
    .string()
    .trim()
    .min(1, 'Nomor rekening wajib diisi')
    .max(255),
  confirmationName: z.string().min(1, 'Nama wajib diisi').max(255),
  confirmed: z.boolean().refine((value) => value, 'Persetujuan wajib diisi'),
});
export type CreditConfirmationForm = z.infer<
  typeof creditConfirmationFormSchema
>;
