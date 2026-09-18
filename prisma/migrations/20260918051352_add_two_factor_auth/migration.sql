-- Admin TOTP two-factor authentication: secret + enrollment flag + single-use
-- backup codes + replay guard on User, plus a short-lived challenge table
-- used between "password correct" and "code verified" during login.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorLastStep" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "TwoFactorPending" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactorPending_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TwoFactorPending_userId_idx" ON "TwoFactorPending"("userId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "TwoFactorPending" ADD CONSTRAINT "TwoFactorPending_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
