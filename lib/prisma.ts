import { PrismaClient } from "@prisma/client";

const CANDIDATE_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

/* Resolve the connection string from whichever env var the host provides.
   Neon / Vercel Postgres integrations may name it POSTGRES_PRISMA_URL,
   POSTGRES_URL, DATABASE_URL_UNPOOLED, etc. — not always DATABASE_URL. */
function resolveDatabaseUrl(): string | undefined {
  for (const k of CANDIDATE_KEYS) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

/* True while `next build` is statically pre-rendering pages
   (Next sets NEXT_PHASE=phase-production-build for the build process and its
   render workers). Data-access code checks this to serve the built-in static
   catalog instead of opening a database connection: the build must never
   depend on a live DB, or an unreachable/paused database stalls static
   generation until Next's 60s worker timeout kills the build. */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/* Tracks whether the last connectivity probe reached the database, so
   callers (e.g. product self-seeding) can cheaply skip further DB work on a
   cold start when the server is down instead of hanging on each query.
   Optimistic by default — assume reachable until a probe proves otherwise. */
let dbReachable = true;
let lastProbeFailedAt = 0;
const REPROBE_COOLDOWN_MS = 30_000;

export function databaseReachable(): boolean {
  return dbReachable;
}

/**
 * Gate for read paths that have a static-catalogue fallback. While the DB is
 * known-unreachable this answers `false` instantly (no connection attempt),
 * so every request isn't taxed the full connect_timeout before falling back.
 * At most one real re-probe (≤5s, capped by connect_timeout) runs per
 * 30s window, so the app recovers by itself shortly after the DB comes back.
 */
export async function dbUsable(): Promise<boolean> {
  if (dbReachable) return true;
  if (Date.now() - lastProbeFailedAt < REPROBE_COOLDOWN_MS) return false;
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    dbReachable = true;
  } catch {
    lastProbeFailedAt = Date.now();
  }
  return dbReachable;
}

/* Append short connect/pool timeouts so a query against an unreachable or
   paused database fails in a few seconds and falls back to the catalog,
   rather than blocking the request (and, at build time, the whole worker)
   for the full TCP/pool timeout. Existing params on the URL are preserved. */
function withTimeouts(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "5");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "10");
    return u.toString();
  } catch {
    return rawUrl;
  }
}

let envSynced = false;

/* Prisma's query engine validates the schema's `env("DATABASE_URL")`
   reference (prisma/schema.prisma) internally — independent of the
   `datasources` override passed to the PrismaClient constructor — for
   some code paths (raw queries, and per production logs, some regular
   queries too: `PrismaClientInitializationError: Environment variable
   not found: DATABASE_URL`). The constructor override alone does not
   prevent that internal check from running.

   This runs lazily (called from ensureSchema() below, not at module
   top-level) and re-checks on every call rather than caching a single
   failure: a first cold-start invocation that races ahead of Vercel's
   own env var injection would otherwise permanently miss the value for
   the rest of that warm instance's lifetime if we only ever checked
   once at import time. */
function syncDatabaseUrlEnv(): void {
  if (envSynced && process.env.DATABASE_URL) return;
  const url = resolveDatabaseUrl();
  if (url) {
    process.env.DATABASE_URL = withTimeouts(url);
    envSynced = true;
  }
}

const rawUrl = resolveDatabaseUrl();
const url = rawUrl ? withTimeouts(rawUrl) : undefined;

// Mirror the resolved value into DATABASE_URL synchronously, before the
// client below is constructed. Without this, on a cold start where the
// value briefly isn't visible yet, the client gets built with no
// `datasources` override and is stuck that way for the rest of this warm
// instance's life — syncDatabaseUrlEnv() (called later, from ensureSchema())
// only mutates process.env, it can't retroactively fix an already-built
// client that resolved its connection lazily from the missing env var.
if (url && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = url;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaReady?: Promise<void>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ============================================================
   Self-healing schema bootstrap.
   ------------------------------------------------------------
   `prisma migrate deploy` (run at build time, see
   scripts/deploy-build.mjs) is the source of truth for the schema.
   But on serverless hosts a build can succeed while the *migration*
   step silently no-ops or drifts (e.g. the DB's migration history
   doesn't match this repo's migrations folder after a squash/reset,
   or the build ran before a schema change landed). That leaves some
   tables present and others missing — which is exactly the failure
   mode where products/newsletter/contact work but auth 500s.

   To make the app resilient to that regardless of build-time state,
   run an idempotent `CREATE TABLE IF NOT EXISTS` pass once per cold
   start before the first query. It mirrors prisma/schema.prisma
   exactly and never touches existing tables/data.
   ============================================================ */

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latin" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "compareAt" INTEGER,
    "description" TEXT NOT NULL,
    "surface" TEXT NOT NULL DEFAULT 'gold',
    "image" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bestSeller" BOOLEAN NOT NULL DEFAULT false,
    "newArrival" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "karats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goldWeight" DOUBLE PRECISION,
    "totalWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category")`,
  // Heal older Product tables that predate the admin-controlled gold specs.
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "karats" TEXT[] DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "goldWeight" DOUBLE PRECISION`,
  `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "totalWeight" DOUBLE PRECISION`,

  `CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "spent" INTEGER NOT NULL DEFAULT 0,
    "joined" TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY,
    "customer" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "date" TEXT NOT NULL,
    "items" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  // A table created by an older version of this bootstrap (before coupons /
  // account-linked orders existed) would be missing these columns — heal it.
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId")`,

  `CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")`,
  `DO $$ BEGIN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END $$`,
  `DO $$ BEGIN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

  `CREATE TABLE IF NOT EXISTS "Session" (
    "token" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3)
  )`,
  // Heal older Session tables that predate absolute session expiry.
  `ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`,
  `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,
  `DO $$ BEGIN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN OTHERS THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS "Newsletter" (
    "email" TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "Coupon" (
    "code" TEXT PRIMARY KEY,
    "description" TEXT NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'percent',
    "value" INTEGER NOT NULL,
    "minSubtotal" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

/** @returns true when the DDL pass ran (memoize), false when skipped
    because the DB is unreachable (leave un-memoized so a later call
    retries once the re-probe cooldown elapses). */
async function bootstrapSchema(): Promise<boolean> {
  // Never touch the database while `next build` pre-renders pages — the build
  // reads from the static catalog instead (see lib/db.ts).
  if (isBuildPhase()) return true;

  // While the DB is known-down and inside the cooldown, skip instantly —
  // no connection attempt, no log spam on every request.
  if (!dbReachable && Date.now() - lastProbeFailedAt < REPROBE_COOLDOWN_MS) {
    return false;
  }

  // One fast connectivity probe before firing ~25 sequential DDL statements.
  // If the server is unreachable, each of those statements would otherwise
  // block on its own connection attempt, and the cumulative stall is what used
  // to trip Next's 60s static-generation timeout at build time and drag out
  // cold starts at runtime. Probe once, record the result, and bail on
  // failure — callers fall back to the built-in catalog.
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    dbReachable = true;
  } catch (err) {
    dbReachable = false;
    lastProbeFailedAt = Date.now();
    console.error("[prisma] database unreachable — skipping schema bootstrap:", err);
    return false;
  }

  // Each statement is isolated: if one fails (e.g. a foreign-key DO block
  // hitting an edge case on a particular provider), the rest must still
  // run. A single shared try/catch around the whole loop previously meant
  // one bad statement could silently skip every table after it — which is
  // exactly how User/Session ended up never created while Product (earlier
  // in the list) did.
  let failures = 0;
  for (const sql of SCHEMA_STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      failures++;
      console.error("[prisma] schema statement failed:", sql.slice(0, 60), err);
    }
  }
  if (failures) {
    console.error(`[prisma] schema self-heal finished with ${failures} failed statement(s)`);
  }
  return true;
}

/**
 * Resolves once the schema has been verified/self-healed for this
 * process. Safe to await from every data-access function — memoized,
 * so it only does real work once per cold start. Never throws: a
 * failure here just means callers fall through to their normal
 * try/catch handling against whatever state the DB is actually in.
 */
export function ensureSchema(): Promise<void> {
  // During `next build` the data layer serves the static catalog, so there is
  // nothing to sync or self-heal — and connecting here would stall the build.
  if (isBuildPhase()) return Promise.resolve();
  syncDatabaseUrlEnv();
  if (!globalForPrisma.prismaSchemaReady) {
    globalForPrisma.prismaSchemaReady = bootstrapSchema()
      .then((completed) => {
        // Skipped because the DB was down: leave un-memoized so the
        // bootstrap re-runs (cooldown-gated) once the DB comes back.
        if (!completed) globalForPrisma.prismaSchemaReady = undefined;
      })
      .catch((err) => {
        console.error("[prisma] schema self-heal failed:", err);
        // Allow a retry on the next cold start / call rather than caching a rejection forever.
        globalForPrisma.prismaSchemaReady = undefined;
      });
  }
  return globalForPrisma.prismaSchemaReady ?? Promise.resolve();
}
