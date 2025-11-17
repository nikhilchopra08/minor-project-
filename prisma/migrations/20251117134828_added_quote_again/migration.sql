/*
  Warnings:

  - A unique constraint covering the columns `[quoteId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quoteId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "quoteId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_quoteId_key" ON "bookings"("quoteId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
