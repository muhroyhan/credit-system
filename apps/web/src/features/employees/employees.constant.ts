import type { EmployeeProfile } from '@credit/contracts';
import type { EmployeeDocuments } from '@web/features/employees/employees.type';

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
