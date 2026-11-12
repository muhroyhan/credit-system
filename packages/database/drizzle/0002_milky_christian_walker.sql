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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_slik_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `debitor` ADD `tanggal_lahir` date;--> statement-breakpoint
ALTER TABLE `debitor` ADD `is_berlaku_seumur_hidup` boolean;--> statement-breakpoint
ALTER TABLE `debitor` ADD `is_same_alamat_ktp` boolean;--> statement-breakpoint
ALTER TABLE `debitor` ADD `no_hp` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `no_telp` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `agama` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `alamat_domisili` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `alamat_ktp` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `employee_id` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `gelar_depan` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `jenis_kelamin` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `kecamatan` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `kelurahan_desa` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `kewarganegaraan` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `kode_pos` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `kota` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `nama_alias` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `nama_ibu_kandung` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `no_ktp` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `no_telp_type` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `pekerjaan` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `pendidikan` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `provinsi` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `status_marital` varchar(255);--> statement-breakpoint
ALTER TABLE `debitor` ADD `tempat_lahir` varchar(255);