-- Admin-controlled gold specs on Product (karats / goldWeight / totalWeight).
-- These columns were previously only created by the runtime self-heal in
-- lib/prisma.ts; a fresh `prisma migrate deploy` + seed failed without them.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "karats" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "goldWeight" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "totalWeight" DOUBLE PRECISION;
