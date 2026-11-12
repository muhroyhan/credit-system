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
