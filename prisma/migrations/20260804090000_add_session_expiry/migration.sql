-- Add absolute session expiry so stale/stolen tokens stop working.
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
