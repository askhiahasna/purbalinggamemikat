-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('HOTEL', 'HOMESTAY', 'VILLA', 'GUESTHOUSE', 'CAMPING', 'OTHER');

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "AccommodationType" NOT NULL DEFAULT 'HOMESTAY',
    "description" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "priceFrom" INTEGER,
    "priceTo" INTEGER,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "websiteUrl" TEXT,
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accommodation_slug_key" ON "Accommodation"("slug");

-- CreateIndex
CREATE INDEX "Accommodation_district_idx" ON "Accommodation"("district");

-- CreateIndex
CREATE INDEX "Accommodation_type_idx" ON "Accommodation"("type");

-- CreateIndex
CREATE INDEX "Accommodation_status_idx" ON "Accommodation"("status");

