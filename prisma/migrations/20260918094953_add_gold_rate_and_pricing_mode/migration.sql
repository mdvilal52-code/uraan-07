-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pricingKarat" TEXT,
ADD COLUMN     "pricingMode" TEXT NOT NULL DEFAULT 'fixed';

-- AlterTable
ALTER TABLE "StoreSettings" ALTER COLUMN "taxRatePercent" SET DEFAULT 0;

-- Changing the column DEFAULT above only affects future rows. taxRatePercent
-- was never read/applied anywhere before this migration, so no admin could
-- have had a real reason to deliberately change it from the old default (5)
-- — reset any existing singleton settings row still sitting at that unused
-- default back to 0, so wiring it into checkout in this same release doesn't
-- silently add a tax charge to every order.
UPDATE "StoreSettings" SET "taxRatePercent" = 0 WHERE "taxRatePercent" = 5;

-- CreateTable
CREATE TABLE "GoldRate" (
    "purity" TEXT NOT NULL,
    "pricePerGram" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'AUD',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "GoldRate_pkey" PRIMARY KEY ("purity")
);
