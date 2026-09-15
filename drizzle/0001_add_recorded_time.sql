ALTER TABLE `records` ADD `created_at` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX `idx_records_created_at` ON `records` (`created_at`);
