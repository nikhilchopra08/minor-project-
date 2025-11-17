/*
  Warnings:

  - You are about to drop the column `quoteId` on the `bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_quoteId_fkey";

-- DropIndex
DROP INDEX "bookings_quoteId_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "quoteId";
