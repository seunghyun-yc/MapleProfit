CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`count` integer NOT NULL,
	`meso` integer NOT NULL,
	`pieces` integer NOT NULL,
	`price` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_records_date` ON `records` (`date`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`price` integer NOT NULL
);
