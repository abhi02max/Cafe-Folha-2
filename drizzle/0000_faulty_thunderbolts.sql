CREATE TABLE `event_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`preferred_date` text NOT NULL,
	`guests` integer NOT NULL,
	`event_type` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_requests_reference_idx` ON `event_requests` (`reference`);--> statement-breakpoint
CREATE INDEX `event_requests_date_idx` ON `event_requests` (`preferred_date`);--> statement-breakpoint
CREATE INDEX `event_requests_status_idx` ON `event_requests` (`status`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`visit_date` text NOT NULL,
	`visit_time` text NOT NULL,
	`guests` integer NOT NULL,
	`occasion` text DEFAULT 'Regular visit' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_reference_idx` ON `reservations` (`reference`);--> statement-breakpoint
CREATE INDEX `reservations_visit_date_idx` ON `reservations` (`visit_date`);--> statement-breakpoint
CREATE INDEX `reservations_status_idx` ON `reservations` (`status`);