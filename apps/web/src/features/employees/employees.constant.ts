import type { EmployeeProfile } from '@credit/contracts';
import type { EmployeeDocuments } from '@web/features/employees/employees.type';

export const employeeProfileFields = [
  ['employeeId', 'Nomor induk'],
  ['noKtp', 'NIK'],
  ['namaLengkap', 'Nama lengkap'],
  ['jenisKelamin', 'Jenis kelamin'],
  ['agama', 'Agama'],
  ['tempatLahir', 'Tempat lahir'],
  ['tanggalLahir', 'Tanggal lahir'],
  ['statusMarital', 'Status perkawinan'],
  ['namaIbuKandung', 'Nama ibu kandung'],
  ['alamatKtp', 'Alamat KTP'],
  ['provinsi', 'Provinsi'],
  ['kota', 'Kota'],
  ['kecamatan', 'Kecamatan'],
  ['kelurahanDesa', 'Kelurahan/desa'],
  ['kodePos', 'Kode pos'],
  ['alamatDomisili', 'Alamat domisili'],
] as const;

export const employeeDocumentLabels = {
  fotoUrl: 'KTP',
  selfieUrl: 'Selfie KTP',
  kkUrl: 'KK',
  slipGajiUrl: 'Slip gaji',
  tandaTanganUrl: 'Tanda tangan',
  npwpUrl: 'NPWP',
} as const;

export const employeeOptionalFields = [
  ['namaAlias', 'Alias'],
  ['noHp', 'Nomor HP'],
  ['noTelp', 'Nomor telepon'],
  ['pekerjaan', 'Pekerjaan'],
  ['pendidikan', 'Pendidikan'],
  ['kewarganegaraan', 'Kewarganegaraan'],
  ['npwp', 'NPWP'],
] as const;

export const emptyDocuments: EmployeeDocuments = {
  fotoUrl: null,
  selfieUrl: null,
  kkUrl: null,
  slipGajiUrl: null,
  tandaTanganUrl: null,
  npwpUrl: null,
};
export const emptyProfile: EmployeeProfile = {
  employeeId: '',
  noKtp: '',
  namaLengkap: '',
  jenisKelamin: '',
  agama: '',
  tempatLahir: '',
  tanggalLahir: '',
  statusMarital: '',
  namaIbuKandung: '',
  alamatKtp: '',
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahanDesa: '',
  kodePos: '',
  alamatDomisili: '',
  namaAlias: '',
  noHp: '',
  noTelp: '',
  pekerjaan: '',
  pendidikan: '',
  kewarganegaraan: '',
  npwp: '',
  takehomePay: '',
};
