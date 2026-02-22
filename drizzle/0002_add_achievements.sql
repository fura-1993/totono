CREATE TABLE `achievements` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(255),
  `serviceType` varchar(100),
  `workDate` varchar(10),
  `details` text,
  `duration` varchar(100),
  `scope` varchar(100),
  `imageUrl` text,
  `isPublished` int NOT NULL DEFAULT 1,
  `displayOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
