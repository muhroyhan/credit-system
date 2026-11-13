import type { EmployeeProfile } from '@credit/contracts';
import type { Identity } from '@server/constant/interface';

/** Synthetic actors map to the two disposable seed tenants. */
export const actors: Record<
  'admin' | 'company' | 'otherCompany' | 'customer' | 'otherCustomer',
  Identity
> = {
  admin: {
    id: 900001,
    type: 'admin',
    slug: 'admin',
    permissions: [
      { program: 'CGP', value: 'READ' },
      { program: 'CGP', value: 'CREATE' },
      { program: 'DKN', value: 'READ' },
      { program: 'DKN', value: 'APPROVAL' },
      { program: 'DKN', value: 'UPDATE' },
    ],
  },
  company: {
    id: 900001,
    type: 'company',
    slug: 'sintetis-satu',
    permissions: [],
  },
  otherCompany: {
    id: 900002,
    type: 'company',
    slug: 'sintetis-dua',
    permissions: [],
  },
  customer: {
    id: 900001,
    type: 'debitor',
    slug: 'sintetis-satu',
    permissions: [],
  },
  otherCustomer: {
    id: 900002,
    type: 'debitor',
    slug: 'sintetis-dua',
    permissions: [],
  },
};

/** Complete profile with deliberate leading zeroes and date-only fields. */
export const profile: EmployeeProfile = {
  employeeId: 'QA001',
  noKtp: '0012345678901234',
  namaLengkap: 'QA Synthetic',
  jenisKelamin: 'Laki-laki',
  agama: 'Synthetic',
  tempatLahir: 'Jakarta',
  tanggalLahir: '1990-01-02',
  statusMarital: 'Synthetic',
  namaIbuKandung: 'Ibu',
  alamatKtp: 'Alamat sintetis',
  provinsi: 'Synthetic',
  kota: 'Synthetic',
  kecamatan: 'Synthetic',
  kelurahanDesa: 'Synthetic',
  kodePos: '00123',
  alamatDomisili: 'Domisili sintetis',
  namaAlias: '',
  noHp: '08123456789',
  noTelp: '',
  pekerjaan: '',
  pendidikan: '',
  kewarganegaraan: '',
  npwp: '',
  takehomePay: '6000000',
};

/** Baseline application is independently expected to produce Rp1,120,000/month. */
export const application = {
  debitorId: 900001,
  jumlahPengajuan: '12000000',
  jangkaWaktuBulan: 12,
  tanggalPengajuan: '2026-11-13',
};
