-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dealerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dealerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_services" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "package_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_services_packageId_serviceId_key" ON "package_services"("packageId", "serviceId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_services" ADD CONSTRAINT "package_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
