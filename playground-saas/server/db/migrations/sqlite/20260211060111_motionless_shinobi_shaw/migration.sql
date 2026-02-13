CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL,
	`description` text,
	`slug` text NOT NULL UNIQUE,
	`type` text DEFAULT 'post' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`content` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` integer NOT NULL,
	`author_id` integer,
	`author_name` text,
	`author_email` text,
	`rating` integer,
	`is_approved` integer DEFAULT false,
	CONSTRAINT `fk_comments_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`category` text,
	`is_read` integer DEFAULT false,
	`metadata` text,
	CONSTRAINT `fk_notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL,
	`description` text,
	`code` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'draft',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`title` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`content` text,
	`excerpt` text,
	`cover_image` text,
	`category_id` integer,
	`is_published` integer DEFAULT false,
	`published_at` integer,
	CONSTRAINT `fk_posts_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL UNIQUE,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `role_resource_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`role_id` integer NOT NULL,
	`resource_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	CONSTRAINT `fk_role_resource_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_role_resource_permissions_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_role_resource_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL UNIQUE,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`email` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'inactive',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`avatar` text,
	`company` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`uuid` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`avatar` text,
	`role_id` integer,
	`reset_token` text,
	`reset_expires` integer,
	`github_id` text UNIQUE,
	`google_id` text UNIQUE,
	CONSTRAINT `fk_users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
);
--> statement-breakpoint
CREATE INDEX `resource_idx` ON `comments` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unq_role_res_perm` ON `role_resource_permissions` (`role_id`,`resource_id`,`permission_id`);