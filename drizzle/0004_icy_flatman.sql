CREATE TABLE `staff_style_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`skill_id` int NOT NULL,
	`hourly_rate` decimal(10,2) NOT NULL DEFAULT '0.00',
	`currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_style_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_staff_style` UNIQUE(`staff_id`,`skill_id`)
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `min_price_amount` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_style_rates` ADD CONSTRAINT `staff_style_rates_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_style_rates` ADD CONSTRAINT `staff_style_rates_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;