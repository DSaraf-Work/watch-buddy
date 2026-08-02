ALTER TABLE `user_preferences` ADD COLUMN `avg_rating` real;
--> statement-breakpoint
ALTER TABLE `user_preferences` ADD COLUMN `total_watched` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `user_preferences` ADD COLUMN `total_watch_time` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `user_preferences` ADD COLUMN `insights_data` text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `recommendations_user_content_unique` ON `recommendations` (`user_id`,`content_id`);
