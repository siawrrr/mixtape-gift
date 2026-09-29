CREATE TABLE `cassettes` (
	`id` varchar(36) NOT NULL,
	`ownerId` int NOT NULL,
	`shareToken` varchar(32) NOT NULL,
	`title` varchar(180) NOT NULL,
	`recipient` varchar(120) NOT NULL DEFAULT '',
	`sender` varchar(120) NOT NULL DEFAULT '',
	`letter` text NOT NULL,
	`bodyJson` longtext NOT NULL,
	`songsJson` longtext NOT NULL,
	`decorationsJson` longtext NOT NULL,
	`effectsJson` longtext NOT NULL,
	`background` varchar(64) NOT NULL DEFAULT 'desk',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cassettes_id` PRIMARY KEY(`id`),
	CONSTRAINT `cassettes_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
