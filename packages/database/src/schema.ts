import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  datetime,
  decimal,
  double,
  int,
  mysqlTable,
  text,
  tinyint,
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

export const credits = mysqlTable('credit', {
  id: id(),
  debitorId: ref('debitor_id'),
  debitorAcknowledgmentTimestamp: date('debitor_acknowledgment_timestamp', {
    mode: 'string',
  }),
  tanggalPengajuan: date('tanggal_pengajuan', { mode: 'string' }),
  biayaAsuransiJiwa: double('biaya_asuransi_jiwa'),
  jangkaWaktuBulan: int('jangka_waktu_bulan'),
  bankAccountName: str('bank_account_name'),
  bankAccountNumber: str('bank_account_number'),
  bankBranch: str('bank_branch'),
  bankName: str('bank_name'),
  bungaAngsuranBulanan: str('bunga_angsuran_bulanan'),
  docUrl: str('doc_url'),
  jumlahAngsuran: str('jumlah_angsuran'),
  jumlahPengajuan: str('jumlah_pengajuan'),
  nilaiAngsuran: str('nilai_angsuran'),
  pokokAngsuran: str('pokok_angsuran'),
  status: str('status'),
  statusAdminApproval: str('status_admin_approval'),
  remarks: text('remarks'),
  ...audit(),
});

export const creditExpense = mysqlTable('credit_expense', {
  id: id(),
  creditId: ref('credit_id'),
  expenseName: str('expense_name'),
  unit: str('unit'),
  value: int('value'),
  amount: decimal('amount', { precision: 30, scale: 2 }),
  ...audit(),
});

export const creditCollection = mysqlTable('credit_collection', {
  id: id(),
  creditId: ref('credit_id'),
  persenPenjamin: int('persen_penjamin'),
  biJenisPenggunaan: str('bi_jenis_penggunaan'),
  biSifatPinjaman: str('bi_sifat_pinjaman'),
  golonganDebitur: str('golongan_debitur'),
  jenisUsaha: str('jenis_usaha'),
  kodeGroup4: str('kode_group_4'),
  kodeGroup5: str('kode_group_5'),
  namaKolektor: str('nama_kolektor'),
  namaMarketing: str('nama_marketing'),
  namaWilayah: str('nama_wilayah'),
  periodePembayaran: str('periode_pembayaran'),
  periodePembayaranBunga: str('periode_pembayaran_bunga'),
  sandiPenjamin: str('sandi_penjamin'),
  sumberPelunasan: str('sumber_pelunasan'),
  ...audit(),
});

export const creditGuarantor = mysqlTable('credit_guarantor', {
  id: id(),
  creditId: ref('credit_id'),
  persentasePenjamin: int('persentase_penjamin'),
  alamat: str('alamat'),
  hubungan: str('hubungan'),
  kodeGolonganPenjamin: str('kode_golongan_penjamin'),
  kodeIdentitasPenjamin: str('kode_identitas_penjamin'),
  nama: str('nama'),
  noId: str('no_id'),
  npwp: str('npwp'),
  pekerjaan: str('pekerjaan'),
  keterangan: text('keterangan'),
  ...audit(),
});

export const creditInsurance = mysqlTable('credit_insurance', {
  id: id(),
  creditId: ref('credit_id'),
  tanggalJtAsuransi: date('tanggal_jt_asuransi', { mode: 'string' }),
  jangkaWaktuAsuransi: int('jangka_waktu_asuransi'),
  nilaiPertanggungan: int('nilai_pertanggungan'),
  namaAsuransi: str('nama_asuransi'),
  statusPertanggungan: str('status_pertanggungan'),
  ...audit(),
});

export const creditPotongan = mysqlTable('credit_potongan', {
  id: id(),
  creditId: ref('credit_id'),
  dendaTunggakanPersentase: double('denda_tunggakan_persentase'),
  lainlainPersentase: double('lainlain_persentase'),
  pajakTransaksiPersentase: double('pajak_transaksi_persentase'),
  provisiPersentase: double('provisi_persentase'),
  admPerBulan: int('adm_per_bulan'),
  biayaTransaksi: int('biaya_transaksi'),
  bpkb: int('bpkb'),
  fiducia: int('fiducia'),
  kebakaran: int('kebakaran'),
  kendaraan: int('kendaraan'),
  lainlainNilai: int('lainlain_nilai'),
  lainnya1: int('lainnya_1'),
  lainnya2: int('lainnya_2'),
  lainnya3: int('lainnya_3'),
  materai: int('materai'),
  notaris: int('notaris'),
  pajakTransaksiNilai: int('pajak_transaksi_nilai'),
  potonganTab: int('potongan_tab'),
  premi: int('premi'),
  provisiNilai: int('provisi_nilai'),
  tabunganWajib: int('tabungan_wajib'),
  rekNotaris: str('rek_notaris'),
  rekPremi: str('rek_premi'),
  rekTabungan: str('rek_tabungan'),
  rekTabunganWajib: str('rek_tabungan_wajib'),
  rekening: str('rekening'),
  ...audit(),
});

export const creditSlikBmpk = mysqlTable('credit_slik_bmpk', {
  id: id(),
  creditId: ref('credit_id'),
  akadPembiayaan: str('akad_pembiayaan'),
  caraRestrukturisasi: str('cara_restrukturisasi'),
  hubunganKeterkaitan: str('hubungan_keterkaitan'),
  jenisKredit: str('jenis_kredit'),
  jenisPenggunaan: str('jenis_penggunaan'),
  jenisSukuBunga: str('jenis_suku_bunga'),
  kategoriDebitur: str('kategori_debitur'),
  kelompokDebitur: str('kelompok_debitur'),
  kodeKeterkaitan: str('kode_keterkaitan'),
  kodeKondisi: str('kode_kondisi'),
  kodeProgramPemerintah: str('kode_program_pemerintah'),
  kotaKabPenggunaan: str('kota_kab_penggunaan'),
  noRekeningSlik: str('no_rekening_slik'),
  orientasiPenggunaan: str('orientasi_penggunaan'),
  penyediaanDana: str('penyediaan_dana'),
  sandiBank: str('sandi_bank'),
  sebabMacet: str('sebab_macet'),
  sektorEkonomi: str('sektor_ekonomi'),
  sifatKredit: str('sifat_kredit'),
  sumberDana: str('sumber_dana'),
  valuta: str('valuta'),
  keterangan: text('keterangan'),
  ...audit(),
});

export const creditSpouse = mysqlTable('credit_spouse', {
  id: id(),
  creditId: ref('credit_id'),
  status: str('status'),
  ...audit(),
});
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
  pengeluaranPerBulan: decimal('pengeluaran_per_bulan', {
    precision: 20,
    scale: 0,
    unsigned: true,
  }),
  penghasilanUtamaPerTahun: decimal('penghasilan_utama_per_tahun', {
    precision: 20,
    scale: 0,
    unsigned: true,
  }),
  potonganPerBulan: decimal('potongan_per_bulan', {
    precision: 20,
    scale: 0,
    unsigned: true,
  }),
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
