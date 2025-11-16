-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'RESPONDED', 'REVISED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RenovationType" AS ENUM ('PANEL_CLEANING', 'INVERTER_UPGRADE', 'EFFICIENCY_IMPROVEMENT', 'WIRING_SAFETY_UPGRADE', 'PANEL_REPLACEMENT', 'SOLAR_MIGRATION', 'COMPLETE_RENOVATION', 'CUSTOM');

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "location" TEXT NOT NULL,
    "currentSetup" TEXT,
    "powerUsage" TEXT NOT NULL,
    "renovationType" "RenovationType" NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "proposedServices" TEXT,
    "totalAmount" DOUBLE PRECISION,
    "breakdown" JSONB,
    "timeline" TEXT,
    "warranty" TEXT,
    "notes" TEXT,
    "revisions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotes_userId_idx" ON "quotes"("userId");

-- CreateIndex
CREATE INDEX "quotes_dealerId_idx" ON "quotes"("dealerId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_createdAt_idx" ON "quotes"("createdAt");

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
