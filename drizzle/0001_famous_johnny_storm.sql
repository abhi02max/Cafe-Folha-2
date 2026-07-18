CREATE TABLE `order_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`fulfillment` text DEFAULT 'Pickup' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_requests_reference_idx` ON `order_requests` (`reference`);--> statement-breakpoint
CREATE INDEX `order_requests_status_idx` ON `order_requests` (`status`);--> statement-breakpoint
CREATE INDEX `order_requests_created_at_idx` ON `order_requests` (`created_at`);