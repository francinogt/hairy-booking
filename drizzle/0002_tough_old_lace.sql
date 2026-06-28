CREATE TABLE `booking_request_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`image_path` varchar(255) NOT NULL,
	`view` enum('front','back') NOT NULL,
	`x` decimal(8,4) NOT NULL DEFAULT '0.0000',
	`y` decimal(8,4) NOT NULL DEFAULT '0.0000',
	`scale` decimal(6,4) NOT NULL DEFAULT '1.0000',
	`rotation_deg` int NOT NULL DEFAULT 0,
	`natural_width` int NOT NULL,
	`natural_height` int NOT NULL,
	`covered_parts` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_request_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`staff_id` int NOT NULL,
	`skill_id` int,
	`gender_used` enum('male','female','diverse'),
	`body_view` enum('front','back') NOT NULL DEFAULT 'front',
	`estimated_duration_min` int NOT NULL,
	`requested_start_at` datetime,
	`status` enum('pending','confirmed','declined','cancelled') NOT NULL DEFAULT 'pending',
	`agb_accepted_at` datetime NOT NULL,
	`customer_note` text,
	`staff_note` text,
	`price_amount` decimal(10,2),
	`price_currency` varchar(3) NOT NULL DEFAULT 'CHF',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipient_user_id` int NOT NULL,
	`type` enum('booking_request_new','booking_request_confirmed','booking_request_declined') NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` varchar(500),
	`link` varchar(255),
	`read_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`endpoint` varchar(512) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_push_endpoint` UNIQUE(`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`description` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_skills_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `staff_skills` (
	`staff_id` int NOT NULL,
	`skill_id` int NOT NULL,
	CONSTRAINT `staff_skills_staff_id_skill_id_pk` PRIMARY KEY(`staff_id`,`skill_id`)
);
--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `service_id` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `request_id` int;--> statement-breakpoint
ALTER TABLE `settings` ADD `agb_text` text;--> statement-breakpoint
ALTER TABLE `users` ADD `gender` enum('male','female','diverse');--> statement-breakpoint
ALTER TABLE `users` ADD `address_line` varchar(160);--> statement-breakpoint
ALTER TABLE `users` ADD `postal_code` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(80);--> statement-breakpoint
ALTER TABLE `users` ADD `country_code` varchar(2) DEFAULT 'CH' NOT NULL;--> statement-breakpoint
ALTER TABLE `booking_request_images` ADD CONSTRAINT `booking_request_images_request_id_booking_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `booking_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_user_id_users_id_fk` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_skills` ADD CONSTRAINT `staff_skills_staff_id_staff_profiles_id_fk` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff_skills` ADD CONSTRAINT `staff_skills_skill_id_skills_id_fk` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_breq_img_request` ON `booking_request_images` (`request_id`);--> statement-breakpoint
CREATE INDEX `idx_breq_staff_status` ON `booking_requests` (`staff_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_breq_customer` ON `booking_requests` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_breq_staff_hold` ON `booking_requests` (`staff_id`,`status`,`requested_start_at`);--> statement-breakpoint
CREATE INDEX `idx_notif_recipient_read` ON `notifications` (`recipient_user_id`,`read_at`);--> statement-breakpoint
CREATE INDEX `idx_push_user` ON `push_subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_staff_skills_skill` ON `staff_skills` (`skill_id`);--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_request_id_booking_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `booking_requests`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_appt_request` ON `appointments` (`request_id`);