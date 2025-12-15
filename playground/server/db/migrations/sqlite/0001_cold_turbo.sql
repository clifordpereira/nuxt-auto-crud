ALTER TABLE `categories` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `categories` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `comments` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `comments` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `permissions` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `permissions` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `resources` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `resources` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `role_resource_permissions` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `role_resource_permissions` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `roles` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `roles` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `updated_by` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `created_by` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_by` integer;