ALTER TABLE `inquiries`
  ADD COLUMN `services` json,
  ADD COLUMN `details` text,
  ADD COLUMN `preferredTiming` varchar(64),
  ADD COLUMN `preferredContactMethod` varchar(32),
  ADD COLUMN `photoCount` int NOT NULL DEFAULT 0,
  ADD COLUMN `adminNotificationSentAt` timestamp NULL,
  ADD COLUMN `autoReplySentAt` timestamp NULL;
