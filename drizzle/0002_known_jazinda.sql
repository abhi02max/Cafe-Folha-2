CREATE TABLE `guest_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`rating` integer NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `guest_feedback_status_idx` ON `guest_feedback` (`status`);--> statement-breakpoint
CREATE INDEX `guest_feedback_created_at_idx` ON `guest_feedback` (`created_at`);--> statement-breakpoint
CREATE TABLE `loyalty_members` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`rewards` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `loyalty_members_code_idx` ON `loyalty_members` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `loyalty_members_phone_idx` ON `loyalty_members` (`phone`);--> statement-breakpoint
CREATE INDEX `loyalty_members_status_idx` ON `loyalty_members` (`status`);