CREATE TABLE `credit_expense` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`credit_id` int unsigned,
	`expense_name` varchar(255),
	`unit` varchar(255),
	`value` int,
	`amount` decimal(30,2),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	CONSTRAINT `credit_expense_id` PRIMARY KEY(`id`)
);
