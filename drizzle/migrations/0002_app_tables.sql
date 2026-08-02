CREATE TABLE `content` (
  `id` text PRIMARY KEY NOT NULL,
  `tmdb_id` integer NOT NULL,
  `imdb_id` text,
  `title` text NOT NULL,
  `original_title` text,
  `content_type` text NOT NULL,
  `overview` text,
  `poster_path` text,
  `backdrop_path` text,
  `release_date` text,
  `runtime` integer,
  `genres` text,
  `cast_data` text,
  `crew_data` text,
  `ratings` text,
  `trailer_url` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_tmdb_type_unique` ON `content` (`tmdb_id`,`content_type`);
--> statement-breakpoint
CREATE INDEX `idx_content_title` ON `content` (`title`);
--> statement-breakpoint
CREATE INDEX `idx_content_type` ON `content` (`content_type`);
--> statement-breakpoint
CREATE TABLE `ott_platforms` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `logo_url` text,
  `website_url` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ott_platforms_name_unique` ON `ott_platforms` (`name`);
--> statement-breakpoint
CREATE TABLE `content_availability` (
  `id` text PRIMARY KEY NOT NULL,
  `content_id` text NOT NULL,
  `platform_id` text NOT NULL,
  `available_from` text,
  `available_until` text,
  `content_url` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`platform_id`) REFERENCES `ott_platforms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_platform_unique` ON `content_availability` (`content_id`,`platform_id`);
--> statement-breakpoint
CREATE INDEX `idx_content_availability_content` ON `content_availability` (`content_id`);
--> statement-breakpoint
CREATE INDEX `idx_content_availability_platform` ON `content_availability` (`platform_id`);
--> statement-breakpoint
CREATE TABLE `user_content_status` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `content_id` text NOT NULL,
  `status` text NOT NULL,
  `rating` integer,
  `notes` text,
  `started_at` integer,
  `completed_at` integer,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_content_status_unique` ON `user_content_status` (`user_id`,`content_id`);
--> statement-breakpoint
CREATE INDEX `idx_user_content_status_user` ON `user_content_status` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_user_content_status_content` ON `user_content_status` (`content_id`);
--> statement-breakpoint
CREATE INDEX `idx_user_content_status_status` ON `user_content_status` (`status`);
--> statement-breakpoint
CREATE TABLE `user_status_preferences` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `status_key` text NOT NULL,
  `custom_label` text NOT NULL,
  `icon` text NOT NULL,
  `color` text NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_status_pref_unique` ON `user_status_preferences` (`user_id`,`status_key`);
--> statement-breakpoint
CREATE INDEX `idx_user_status_preferences_user` ON `user_status_preferences` (`user_id`);
--> statement-breakpoint
CREATE TABLE `watchlists` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `description` text,
  `owner_id` text NOT NULL,
  `is_shared` integer DEFAULT false NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_watchlists_owner` ON `watchlists` (`owner_id`);
--> statement-breakpoint
CREATE TABLE `watchlist_members` (
  `id` text PRIMARY KEY NOT NULL,
  `watchlist_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text NOT NULL,
  `joined_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_member_unique` ON `watchlist_members` (`watchlist_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_watchlist_members_user` ON `watchlist_members` (`user_id`);
--> statement-breakpoint
CREATE TABLE `watchlist_items` (
  `id` text PRIMARY KEY NOT NULL,
  `watchlist_id` text NOT NULL,
  `content_id` text NOT NULL,
  `added_by` text,
  `priority` text,
  `notes` text,
  `added_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_item_unique` ON `watchlist_items` (`watchlist_id`,`content_id`);
--> statement-breakpoint
CREATE INDEX `idx_watchlist_items_watchlist` ON `watchlist_items` (`watchlist_id`);
--> statement-breakpoint
CREATE INDEX `idx_watchlist_items_content` ON `watchlist_items` (`content_id`);
--> statement-breakpoint
CREATE TABLE `watch_history` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `content_id` text NOT NULL,
  `platform_id` text,
  `watched_at` integer NOT NULL,
  `rating` integer,
  `review` text,
  `is_rewatch` integer DEFAULT false NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`platform_id`) REFERENCES `ott_platforms`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_watch_history_user` ON `watch_history` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_watch_history_content` ON `watch_history` (`content_id`);
--> statement-breakpoint
CREATE INDEX `idx_watch_history_watched_at` ON `watch_history` (`watched_at`);
--> statement-breakpoint
CREATE TABLE `watch_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `history_id` text NOT NULL,
  `season_number` integer,
  `episode_number` integer,
  `watched_at` integer NOT NULL,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`history_id`) REFERENCES `watch_history`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_watch_sessions_history` ON `watch_sessions` (`history_id`);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `favorite_genres` text,
  `favorite_platforms` text,
  `computed_at` integer,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);
--> statement-breakpoint
CREATE TABLE `recommendations` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `content_id` text NOT NULL,
  `score` integer NOT NULL,
  `reason` text,
  `created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_recommendations_user` ON `recommendations` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_recommendations_score` ON `recommendations` (`score`);
