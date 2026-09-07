CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`currency` text NOT NULL,
	`initialBalance` real NOT NULL,
	`color` text NOT NULL,
	`archivedAt` text
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`color` text NOT NULL,
	`kind` text NOT NULL,
	`order` integer NOT NULL,
	`archivedAt` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`note` text NOT NULL,
	`type` text NOT NULL,
	`accountId` text,
	`categoryId` text,
	`amount` real,
	`fromAccountId` text,
	`toAccountId` text,
	`fromAmount` real,
	`toAmount` real
);
