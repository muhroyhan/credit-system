import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  double,
  tinyint,
  datetime,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';

const id = () => int('id', { unsigned: true }).primaryKey().autoincrement();
const timestamps = () => ({
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
const audit = () => ({
  ...timestamps(),
  createdBy: varchar('created_by', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 255 }),
});
const str = (name: string) => varchar(name, { length: 255 });
const ref = (name: string) => int(name, { unsigned: true });
export const constants = mysqlTable('constant', {
  id: id(),
  name: str('name'),
  type: str('type'),
  value: str('value'),
  ...audit(),
});
export const countries = mysqlTable('country', {
  id: id(),
  code: str('code'),
  value: str('value'),
  ...audit(),
});
export const entityTypes = mysqlTable('entity_type', {
  id: id(),
  value: str('value'),
  ...timestamps(),
});
export const programs = mysqlTable('program', {
  id: id(),
  abbreviation: str('abbreviation'),
  name: str('name'),
  ...timestamps(),
});
export const adminUsers = mysqlTable('admin_user', {
  id: id(),
  isActive: boolean('is_active'),
  email: str('email'),
  password: str('password'),
  username: str('username'),
  ...audit(),
});
export const roles = mysqlTable('role', {
  id: id(),
  adminUserId: ref('admin_user_id'),
  programId: ref('program_id'),
  value: str('value'),
  ...timestamps(),
});
export const users = mysqlTable('user', {
  id: id(),
  entityTypeId: ref('entity_type_id'),
  companyName: str('company_name'),
  email: str('email'),
  password: str('password'),
  slug: str('slug'),
  status: str('status'),
  username: str('username'),
  ...audit(),
});
export const userBiaya = mysqlTable('user_biaya', {
  id: id(),
  userId: ref('user_id'),
  expenseType: str('expense_type'),
  type: str('type'),
  value: int('value'),
  ...audit(),
});
export const userBungaKredit = mysqlTable('user_bunga_kredit', {
  id: id(),
  userId: ref('user_id'),
  bungaPercentage: str('bunga_percentage'),
  jangkaWaktuBulan: str('jangka_waktu_bulan'),
  ...audit(),
});
export const debitors = mysqlTable('debitor', {
  id: id(),
  tanggalLahir: date('tanggal_lahir', { mode: 'string' }),
  isBerlakuSeumurHidup: boolean('is_berlaku_seumur_hidup'),
  isSameAlamatKtp: boolean('is_same_alamat_ktp'),
  noHp: str('no_hp'),
  noTelp: str('no_telp'),
  userId: ref('user_id'),
  agama: str('agama'),
  alamatDomisili: str('alamat_domisili'),
  alamatKtp: str('alamat_ktp'),
  employeeId: str('employee_id'),
  gelarDepan: str('gelar_depan'),
  jenisKelamin: str('jenis_kelamin'),
  kecamatan: str('kecamatan'),
  kelurahanDesa: str('kelurahan_desa'),
  kewarganegaraan: str('kewarganegaraan'),
  kodePos: str('kode_pos'),
  kota: str('kota'),
  namaAlias: str('nama_alias'),
  namaIbuKandung: str('nama_ibu_kandung'),
  namaLengkap: str('nama_lengkap'),
  noKtp: str('no_ktp'),
  noTelpType: str('no_telp_type'),
  password: str('password'),
  pekerjaan: str('pekerjaan'),
  pendidikan: str('pendidikan'),
  provinsi: str('provinsi'),
  statusMarital: str('status_marital'),
  tempatLahir: str('tempat_lahir'),
  username: str('username'),
  ...audit(),
});

export const debitorData = mysqlTable('debitor_data', {
  id: id(),
  debitorId: ref('debitor_id'),
  fotoUrl: str('foto_url'),
  kkUrl: str('kk_url'),
  npwp: str('npwp'),
  npwpUrl: str('npwp_url'),
  selfieUrl: str('selfie_url'),
  slipGajiUrl: str('slip_gaji_url'),
  tandaTanganUrl: str('tanda_tangan_url'),
  ...audit(),
});

export const debitorFamily = mysqlTable('debitor_family', {
  id: id(),
  anak_1TanggalLahir: date('anak_1_tanggal_lahir', { mode: 'string' }),
  anak_2TanggalLahir: date('anak_2_tanggal_lahir', { mode: 'string' }),
  anak_3TanggalLahir: date('anak_3_tanggal_lahir', { mode: 'string' }),
  tanggalLahirPasangan: date('tanggal_lahir_pasangan', { mode: 'string' }),
  tanggalPernikahan: date('tanggal_pernikahan', { mode: 'string' }),
  debitorId: ref('debitor_id'),
  anak_1Nama: str('anak_1_nama'),
  anak_2Nama: str('anak_2_nama'),
  anak_3Nama: str('anak_3_nama'),
  hobi: str('hobi'),
  namaPasangan: str('nama_pasangan'),
  noAkta: str('no_akta'),
  noIdPasangan: str('no_id_pasangan'),
  noKk: str('no_kk'),
  tipeAkta: str('tipe_akta'),
  ...audit(),
});

export const debitorFinancial = mysqlTable('debitor_financial', {
  id: id(),
  pengeluaranPerBulan: decimal('pengeluaran_per_bulan', { precision: 20, scale: 0, unsigned: true }),
  penghasilanUtamaPerTahun: decimal('penghasilan_utama_per_tahun', { precision: 20, scale: 0, unsigned: true }),
  potonganPerBulan: decimal('potongan_per_bulan', { precision: 20, scale: 0, unsigned: true }),
  debitorId: ref('debitor_id'),
  frekTransPemasukan: ref('frek_trans_pemasukan'),
  frekTransPengeluaran: ref('frek_trans_pengeluaran'),
  takehomePay: ref('takehome_pay'),
  noRekeningBank: str('no_rekening_bank'),
  pemasukanPerBulan: str('pemasukan_per_bulan'),
  sumberDana: str('sumber_dana'),
  sumberPenghasilan: str('sumber_penghasilan'),
  tujuanPembukaanRekTab: str('tujuan_pembukaan_rek_tab'),
  tujuanPenggunaanDana: str('tujuan_penggunaan_dana'),
  ...audit(),
});

export const debitorGps = mysqlTable('debitor_gps', {
  id: id(),
  latitude: double('latitude'),
  longitude: double('longitude'),
  debitorId: ref('debitor_id'),
  ...audit(),
});

export const debitorOthers = mysqlTable('debitor_others', {
  id: id(),
  debitorId: ref('debitor_id'),
  negaraDomisiliId: ref('negara_domisili_id'),
  alamatKerja: str('alamat_kerja'),
  alamatSurat: str('alamat_surat'),
  bidangUsahaTempatKerja: str('bidang_usaha_tempat_kerja'),
  email: str('email'),
  golonganDebitur: str('golongan_debitur'),
  hubunganDebiturDenganBank: str('hubungan_debitur_dengan_bank'),
  jabatan: str('jabatan'),
  keterangan: str('keterangan'),
  kotaKabUsaha: str('kota_kab_usaha'),
  namaDivisi: str('nama_divisi'),
  namaKantor: str('nama_kantor'),
  namaNasabahSid: str('nama_nasabah_sid'),
  noTelpKantor: str('no_telp_kantor'),
  pangsaPemilikan: str('pangsa_pemilikan'),
  pekerjaan: str('pekerjaan'),
  perusahaanTempatKerja: str('perusahaan_tempat_kerja'),
  melampauiBmpk: tinyint('melampaui_bmpk', { unsigned: true }),
  melanggarBmpk: tinyint('melanggar_bmpk', { unsigned: true }),
  ...audit(),
});

export const debitorSlik = mysqlTable('debitor_slik', {
  id: id(),
  debitorId: ref('debitor_id'),
  badanUsaha: str('badan_usaha'),
  bidangUsaha: str('bidang_usaha'),
  gelar: str('gelar'),
  golonganDebitur: str('golongan_debitur'),
  hubunganLjk: str('hubungan_ljk'),
  lembagaPemeringkat: str('lembaga_pemeringkat'),
  negaraId: str('negara_id'),
  pekerjaan: str('pekerjaan'),
  sumberPenghasilan: str('sumber_penghasilan'),
  ...audit(),
});
