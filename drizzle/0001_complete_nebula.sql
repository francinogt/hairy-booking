CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('admin','customer') NOT NULL DEFAULT 'customer',
	`first_name` varchar(80) NOT NULL,
	`last_name` varchar(80) NOT NULL,
	`display_name` varchar(120),
	`invited_by_user_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	`accepted_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_invitations_token` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `color_footer_bg` varchar(9) DEFAULT '#111827' NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `color_footer_text` varchar(9) DEFAULT '#9ca3af' NOT NULL;--> statement-breakpoint
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_invited_by_user_id_users_id_fk` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_invitations_email` ON `invitations` (`email`);