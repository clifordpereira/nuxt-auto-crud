ALTER TABLE `users` ADD `reset_token` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reset_expires` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `github_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `google_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_github_id_unique` ON `users` (`github_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);