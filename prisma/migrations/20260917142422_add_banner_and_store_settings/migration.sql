-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "buttonText" TEXT,
    "link" TEXT,
    "image" TEXT,
    "surface" TEXT NOT NULL DEFAULT 'gold',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'Ariana Gems & Jewellery',
    "email" TEXT NOT NULL DEFAULT 'hello@ariana.example',
    "phone" TEXT NOT NULL DEFAULT '+61 3 9791 1331',
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "freeShippingThreshold" INTEGER NOT NULL DEFAULT 500,
    "taxRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "notifyNewOrders" BOOLEAN NOT NULL DEFAULT true,
    "notifyLowStock" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);
