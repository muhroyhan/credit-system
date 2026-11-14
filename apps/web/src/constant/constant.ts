import {
  adminRoleSchema,
  CompanyStatusEnum,
  CreditStatusEnum,
} from '@credit/contracts';

export const PERMISSION_OPTIONS = adminRoleSchema.shape.value.options.map(
  (value) => ({ value, label: value }),
);

/** Display labels for shared sort keys; API values stay unchanged. */
export const listingSortLabels: Record<string, string> = {
  createdAt: 'Tanggal dibuat',
  id: 'ID',
  employeeId: 'Nomor induk',
  namaLengkap: 'Nama lengkap',
  tanggalPengajuan: 'Tanggal pengajuan',
  jumlahPengajuan: 'Nominal pengajuan',
};

/** Presentation only; original enum values remain the API and workflow contract. */
export const statusPresentation: Record<
  string,
  { label: string; color: string }
> = {
  [CreditStatusEnum.Pending]: { label: 'Menunggu', color: 'yellow' },
  [CreditStatusEnum.Approved]: { label: 'Disetujui', color: 'green' },
  [CreditStatusEnum.Rejected]: { label: 'Ditolak', color: 'red' },
  [CreditStatusEnum.Completed]: { label: 'Selesai', color: 'blue' },
  [CompanyStatusEnum.Active]: { label: 'Aktif', color: 'green' },
  [CompanyStatusEnum.Inactive]: { label: 'Tidak aktif', color: 'gray' },
  [CompanyStatusEnum.Blocked]: { label: 'Diblokir', color: 'red' },
};
