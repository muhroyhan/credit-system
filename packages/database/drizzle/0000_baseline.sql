CREATE TABLE `admin_user` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`is_active` boolean,
	`email` varchar(255),
	`password` varchar(255),
	`username` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `admin_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agreement_sequence` (
	`month` varchar(7) NOT NULL,
	`next_value` int unsigned NOT NULL,
	CONSTRAINT `agreement_sequence_month` PRIMARY KEY(`month`)
);
--> statement-breakpoint
CREATE TABLE `constant` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`type` varchar(255),
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `constant_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `country` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(255),
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `country_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_collection` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`persen_penjamin` int,
	`bi_jenis_penggunaan` varchar(255),
	`bi_sifat_pinjaman` varchar(255),
	`golongan_debitur` varchar(255),
	`jenis_usaha` varchar(255),
	`kode_group_4` varchar(255),
	`kode_group_5` varchar(255),
	`nama_kolektor` varchar(255),
	`nama_marketing` varchar(255),
	`nama_wilayah` varchar(255),
	`periode_pembayaran` varchar(255),
	`periode_pembayaran_bunga` varchar(255),
	`sandi_penjamin` varchar(255),
	`sumber_pelunasan` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_collection_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_expense` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`expense_name` varchar(255),
	`unit` varchar(255),
	`value` int,
	`amount` decimal(30,2),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_expense_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_guarantor` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`persentase_penjamin` int,
	`alamat` varchar(255),
	`hubungan` varchar(255),
	`kode_golongan_penjamin` varchar(255),
	`kode_identitas_penjamin` varchar(255),
	`nama` varchar(255),
	`no_id` varchar(255),
	`npwp` varchar(255),
	`pekerjaan` varchar(255),
	`keterangan` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_guarantor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_insurance` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`tanggal_jt_asuransi` date,
	`jangka_waktu_asuransi` int,
	`nilai_pertanggungan` int,
	`nama_asuransi` varchar(255),
	`status_pertanggungan` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_insurance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_potongan` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`denda_tunggakan_persentase` double,
	`lainlain_persentase` double,
	`pajak_transaksi_persentase` double,
	`provisi_persentase` double,
	`adm_per_bulan` int,
	`biaya_transaksi` int,
	`bpkb` int,
	`fiducia` int,
	`kebakaran` int,
	`kendaraan` int,
	`lainlain_nilai` int,
	`lainnya_1` int,
	`lainnya_2` int,
	`lainnya_3` int,
	`materai` int,
	`notaris` int,
	`pajak_transaksi_nilai` int,
	`potongan_tab` int,
	`premi` int,
	`provisi_nilai` int,
	`tabungan_wajib` int,
	`rek_notaris` varchar(255),
	`rek_premi` varchar(255),
	`rek_tabungan` varchar(255),
	`rek_tabungan_wajib` varchar(255),
	`rekening` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_potongan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_slik_bmpk` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`akad_pembiayaan` varchar(255),
	`cara_restrukturisasi` varchar(255),
	`hubungan_keterkaitan` varchar(255),
	`jenis_kredit` varchar(255),
	`jenis_penggunaan` varchar(255),
	`jenis_suku_bunga` varchar(255),
	`kategori_debitur` varchar(255),
	`kelompok_debitur` varchar(255),
	`kode_keterkaitan` varchar(255),
	`kode_kondisi` varchar(255),
	`kode_program_pemerintah` varchar(255),
	`kota_kab_penggunaan` varchar(255),
	`no_rekening_slik` varchar(255),
	`orientasi_penggunaan` varchar(255),
	`penyediaan_dana` varchar(255),
	`sandi_bank` varchar(255),
	`sebab_macet` varchar(255),
	`sektor_ekonomi` varchar(255),
	`sifat_kredit` varchar(255),
	`sumber_dana` varchar(255),
	`valuta` varchar(255),
	`keterangan` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_slik_bmpk_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_spouse` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`status` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_spouse_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`debitor_id` int unsigned,
	`debitor_acknowledgment_timestamp` date,
	`tanggal_pengajuan` date,
	`biaya_asuransi_jiwa` double,
	`jangka_waktu_bulan` int,
	`agreement_number` varchar(255),
	`bank_account_name` varchar(255),
	`bank_account_number` varchar(255),
	`bank_branch` varchar(255),
	`bank_name` varchar(255),
	`bunga_angsuran_bulanan` varchar(255),
	`doc_url` varchar(255),
	`jumlah_angsuran` varchar(255),
	`jumlah_pengajuan` varchar(255),
	`nilai_angsuran` varchar(255),
	`pokok_angsuran` varchar(255),
	`status` varchar(255),
	`status_admin_approval` varchar(255),
	`remarks` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_id` PRIMARY KEY(`id`),
	CONSTRAINT `credit_agreement_number_unique` UNIQUE(`agreement_number`)
);
--> statement-breakpoint
CREATE TABLE `debitor_data` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`debitor_id` int unsigned,
	`foto_url` varchar(255),
	`kk_url` varchar(255),
	`npwp` varchar(255),
	`npwp_url` varchar(255),
	`selfie_url` varchar(255),
	`slip_gaji_url` varchar(255),
	`tanda_tangan_url` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor_family` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`anak_1_tanggal_lahir` date,
	`anak_2_tanggal_lahir` date,
	`anak_3_tanggal_lahir` date,
	`tanggal_lahir_pasangan` date,
	`tanggal_pernikahan` date,
	`debitor_id` int unsigned,
	`anak_1_nama` varchar(255),
	`anak_2_nama` varchar(255),
	`anak_3_nama` varchar(255),
	`hobi` varchar(255),
	`nama_pasangan` varchar(255),
	`no_akta` varchar(255),
	`no_id_pasangan` varchar(255),
	`no_kk` varchar(255),
	`tipe_akta` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_family_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor_financial` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`pengeluaran_per_bulan` decimal(20,0) unsigned,
	`penghasilan_utama_per_tahun` decimal(20,0) unsigned,
	`potongan_per_bulan` decimal(20,0) unsigned,
	`debitor_id` int unsigned,
	`frek_trans_pemasukan` int unsigned,
	`frek_trans_pengeluaran` int unsigned,
	`takehome_pay` int unsigned,
	`no_rekening_bank` varchar(255),
	`pemasukan_per_bulan` varchar(255),
	`sumber_dana` varchar(255),
	`sumber_penghasilan` varchar(255),
	`tujuan_pembukaan_rek_tab` varchar(255),
	`tujuan_penggunaan_dana` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_financial_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor_gps` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`latitude` double,
	`longitude` double,
	`debitor_id` int unsigned,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_gps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor_others` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`debitor_id` int unsigned,
	`negara_domisili_id` int unsigned,
	`alamat_kerja` varchar(255),
	`alamat_surat` varchar(255),
	`bidang_usaha_tempat_kerja` varchar(255),
	`email` varchar(255),
	`golongan_debitur` varchar(255),
	`hubungan_debitur_dengan_bank` varchar(255),
	`jabatan` varchar(255),
	`keterangan` varchar(255),
	`kota_kab_usaha` varchar(255),
	`nama_divisi` varchar(255),
	`nama_kantor` varchar(255),
	`nama_nasabah_sid` varchar(255),
	`no_telp_kantor` varchar(255),
	`pangsa_pemilikan` varchar(255),
	`pekerjaan` varchar(255),
	`perusahaan_tempat_kerja` varchar(255),
	`melampaui_bmpk` tinyint unsigned,
	`melanggar_bmpk` tinyint unsigned,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_others_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor_slik` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`debitor_id` int unsigned,
	`badan_usaha` varchar(255),
	`bidang_usaha` varchar(255),
	`gelar` varchar(255),
	`golongan_debitur` varchar(255),
	`hubungan_ljk` varchar(255),
	`lembaga_pemeringkat` varchar(255),
	`negara_id` varchar(255),
	`pekerjaan` varchar(255),
	`sumber_penghasilan` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_slik_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`tanggal_lahir` date,
	`is_berlaku_seumur_hidup` boolean,
	`is_same_alamat_ktp` boolean,
	`no_hp` varchar(255),
	`no_telp` varchar(255),
	`user_id` int unsigned,
	`agama` varchar(255),
	`alamat_domisili` varchar(255),
	`alamat_ktp` varchar(255),
	`employee_id` varchar(255),
	`gelar_depan` varchar(255),
	`jenis_kelamin` varchar(255),
	`kecamatan` varchar(255),
	`kelurahan_desa` varchar(255),
	`kewarganegaraan` varchar(255),
	`kode_pos` varchar(255),
	`kota` varchar(255),
	`nama_alias` varchar(255),
	`nama_ibu_kandung` varchar(255),
	`nama_lengkap` varchar(255),
	`no_ktp` varchar(255),
	`no_telp_type` varchar(255),
	`password` varchar(255),
	`pekerjaan` varchar(255),
	`pendidikan` varchar(255),
	`provinsi` varchar(255),
	`status_marital` varchar(255),
	`tempat_lahir` varchar(255),
	`username` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_type` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entity_type_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`abbreviation` varchar(255),
	`name` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `program_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`admin_user_id` int unsigned,
	`program_id` int unsigned,
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `role_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_biaya` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned,
	`expense_type` varchar(255),
	`type` varchar(255),
	`value` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `user_biaya_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_bunga_kredit` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned,
	`bunga_percentage` varchar(255),
	`jangka_waktu_bulan` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `user_bunga_kredit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`entity_type_id` int unsigned,
	`company_name` varchar(255),
	`email` varchar(255),
	`password` varchar(255),
	`slug` varchar(255),
	`status` varchar(255),
	`username` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
