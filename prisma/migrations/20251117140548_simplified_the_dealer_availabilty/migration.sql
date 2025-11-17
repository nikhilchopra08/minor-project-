/*
  Warnings:

  - You are about to drop the column `currentBookings` on the `dealer_availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `dealer_availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `maxBookings` on the `dealer_availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `slotDuration` on the `dealer_availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `dealer_availabilities` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `dealer_availabilities` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "dealer_availabilities_status_idx";

-- AlterTable
ALTER TABLE "dealer_availabilities" DROP COLUMN "currentBookings",
DROP COLUMN "endTime",
DROP COLUMN "maxBookings",
DROP COLUMN "slotDuration",
DROP COLUMN "startTime",
DROP COLUMN "status",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT false;
