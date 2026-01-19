/*
  Warnings:

  - You are about to drop the column `accountId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `calendarGroupId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Calendar` table. All the data in the column will be lost.
  - You are about to drop the column `calendarId` on the `ChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChangeLog` table. All the data in the column will be lost.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `calendarId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CalendarGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[calendar_id,provider_event_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_role` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_calendar_id` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendar_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_event_id` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Calendar` DROP FOREIGN KEY `Calendar_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `Calendar` DROP FOREIGN KEY `Calendar_calendarGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `Calendar` DROP FOREIGN KEY `Calendar_userId_fkey`;

-- DropForeignKey
ALTER TABLE `CalendarGroup` DROP FOREIGN KEY `CalendarGroup_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ChangeLog` DROP FOREIGN KEY `ChangeLog_calendarId_fkey`;

-- DropForeignKey
ALTER TABLE `ChangeLog` DROP FOREIGN KEY `ChangeLog_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_calendarId_fkey`;

-- DropForeignKey
ALTER TABLE `Event` DROP FOREIGN KEY `Event_userId_fkey`;

-- DropForeignKey
ALTER TABLE `VerificationToken` DROP FOREIGN KEY `VerificationToken_userId_fkey`;

-- DropIndex
DROP INDEX `Calendar_accountId_fkey` ON `Calendar`;

-- DropIndex
DROP INDEX `Calendar_calendarGroupId_fkey` ON `Calendar`;

-- DropIndex
DROP INDEX `Calendar_externalId_key` ON `Calendar`;

-- DropIndex
DROP INDEX `Calendar_userId_fkey` ON `Calendar`;

-- DropIndex
DROP INDEX `ChangeLog_calendarId_fkey` ON `ChangeLog`;

-- DropIndex
DROP INDEX `ChangeLog_userId_fkey` ON `ChangeLog`;

-- DropIndex
DROP INDEX `Event_calendarId_fkey` ON `Event`;

-- DropIndex
DROP INDEX `Event_externalId_key` ON `Event`;

-- DropIndex
DROP INDEX `Event_userId_fkey` ON `Event`;

-- AlterTable
ALTER TABLE `Calendar` DROP COLUMN `accountId`,
    DROP COLUMN `calendarGroupId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `externalId`,
    DROP COLUMN `provider`,
    DROP COLUMN `userId`,
    ADD COLUMN `access_role` VARCHAR(191) NOT NULL,
    ADD COLUMN `account_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `last_synced_at` DATETIME(3) NULL,
    ADD COLUMN `primary` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `provider_calendar_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `selected` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `time_zone` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ChangeLog` DROP COLUMN `calendarId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `calendar_id` VARCHAR(191) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` DROP PRIMARY KEY,
    DROP COLUMN `calendarId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `endTime`,
    DROP COLUMN `externalId`,
    DROP COLUMN `startTime`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `all_day_event` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `calendar_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `end` DATETIME(3) NOT NULL,
    ADD COLUMN `provider_event_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `start` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Account`;

-- DropTable
DROP TABLE `CalendarGroup`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `VerificationToken`;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `premium` BOOLEAN NOT NULL DEFAULT false,
    `email_verified` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('google', 'microsoft', 'apple') NOT NULL,
    `provider_user_id` VARCHAR(191) NOT NULL,
    `access_token` TEXT NULL,
    `refresh_token` TEXT NULL,
    `expires_in` DATETIME(3) NULL,
    `username` VARCHAR(191) NULL,
    `credential` TEXT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `accounts_provider_user_id_key`(`provider_user_id`),
    UNIQUE INDEX `accounts_user_id_provider_key`(`user_id`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `verification_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('verification', 'sync', 'alert', 'payment') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Event_calendar_id_provider_event_id_key` ON `Event`(`calendar_id`, `provider_event_id`);

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_tokens` ADD CONSTRAINT `verification_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Calendar` ADD CONSTRAINT `Calendar_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Calendar` ADD CONSTRAINT `Calendar_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_calendar_id_fkey` FOREIGN KEY (`calendar_id`) REFERENCES `Calendar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChangeLog` ADD CONSTRAINT `ChangeLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChangeLog` ADD CONSTRAINT `ChangeLog_calendar_id_fkey` FOREIGN KEY (`calendar_id`) REFERENCES `Calendar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
