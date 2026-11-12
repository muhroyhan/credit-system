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

export const employeeDocumentKinds = [
  'fotoUrl',
  'selfieUrl',
  'kkUrl',
  'slipGajiUrl',
  'tandaTanganUrl',
  'npwpUrl',
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
