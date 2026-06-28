CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`service_id` int NOT NULL,
	`start_at` datetime NOT NULL,
	`end_at` datetime NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`price_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`price_currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`customer_note` text,
	`staff_note` text,
	`cancelled_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocked_time` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`start_at` datetime NOT NULL,
	`end_at` datetime NOT NULL,
	`reason` varchar(160),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_time_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`category_id` int,
	`name` varchar(120) NOT NULL,
	`description` text,
	`duration_min` int NOT NULL,
	`buffer_before_min` int NOT NULL DEFAULT 0,
	`buffer_after_min` int NOT NULL DEFAULT 0,
	`price_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`price_currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_used_at` datetime,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_name` varchar(120) NOT NULL DEFAULT 'Mein Studio',
	`short_name` varchar(24) NOT NULL DEFAULT 'Studio',
	`industry` varchar(50) NOT NULL DEFAULT 'tattoo',
	`contact_email` varchar(255),
	`contact_phone` varchar(40),
	`address_line` varchar(160),
	`postal_code` varchar(16),
	`city` varchar(80),
	`country_code` varchar(2) NOT NULL DEFAULT 'CH',
	`timezone` varchar(64) NOT NULL DEFAULT 'Europe/Zurich',
	`locale` varchar(10) NOT NULL DEFAULT 'de-CH',
	`currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`slot_interval_min` int NOT NULL DEFAULT 15,
	`lead_time_min` int NOT NULL DEFAULT 60,
	`booking_horizon_days` int NOT NULL DEFAULT 60,
	`logo_path` varchar(255),
	`color_navbar_bg` varchar(9) NOT NULL DEFAULT '#111827',
	`color_navbar_text` varchar(9) NOT NULL DEFAULT '#ffffff',
	`color_page_bg` varchar(9) NOT NULL DEFAULT '#ffffff',
	`color_text` varchar(9) NOT NULL DEFAULT '#171717',
	`color_accent` varchar(9) NOT NULL DEFAULT '#2563eb',
	`font_heading` varchar(40) NOT NULL DEFAULT 'geist',
	`font_body` varchar(40) NOT NULL DEFAULT 'geist',
	`pwa_theme_color` varchar(9) NOT NULL DEFAULT '#111827',
	`pwa_background_color` varchar(9) NOT NULL DEFAULT '#ffffff',
	`branding_extra` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`display_name` varchar(120) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`bio` text,
	`avatar_url` varchar(255),
	`specialty` varchar(120),
	`is_bookable` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_staff_user` UNIQUE(`user_id`),
	CONSTRAINT `uq_staff_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('owner','admin','customer') NOT NULL DEFAULT 'customer',
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`first_name` varchar(80) NOT NULL,
	`last_name` varchar(80) NOT NULL,
	`phone` varchar(40),
	`email_verified_at` datetime,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_users_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `working_hours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`weekday` enum('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `working_hours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blocked_time` ADD CONSTRAINT `blocked_time_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_category_id_service_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `working_hours` ADD CONSTRAINT `working_hours_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_appt_staff_start` ON `appointments` (`staff_id`,`start_at`);--> statement-breakpoint
CREATE INDEX `idx_appt_customer_start` ON `appointments` (`customer_id`,`start_at`);--> statement-breakpoint
CREATE INDEX `idx_appt_status` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_blocked_staff_range` ON `blocked_time` (`staff_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE INDEX `idx_services_staff_active` ON `services` (`staff_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `idx_working_hours_staff_weekday` ON `working_hours` (`staff_id`,`weekday`);