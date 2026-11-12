CREATE TABLE `admin_user` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`is_active` boolean,
	`email` varchar(255),
	`password` varchar(255),
	`username` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `admin_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `constant` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`type` varchar(255),
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `country_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debitor` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned,
	`username` varchar(255),
	`password` varchar(255),
	`nama_lengkap` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `debitor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entity_type` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `entity_type_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`abbreviation` varchar(255),
	`name` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `program_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`admin_user_id` int unsigned,
	`program_id` int unsigned,
	`value` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
