import { PrismaClient } from "@prisma/client";

/* Resolve the connection string from whichever env var the host provides.
   Neon / Vercel Postgres integrations may name it POSTGRES_PRISMA_URL,
   POSTGRES_URL, DATABASE_URL_UNPOOLED, etc. — not always DATABASE_URL. */
function resolveDatabaseUrl(): string | undefined {
  const keys = [
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "DATABASE_URL_UNPOOLED",
    "POSTGRES_URL_NON_POOLING",
  ];
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

const url = resolveDatabaseUrl();

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category")`,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt")`,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
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
];

async function bootstrapSchema(): Promise<void> {
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
}

/**
 * Resolves once the schema has been verified/self-healed for this
 * process. Safe to await from every data-access function — memoized,
 * so it only does real work once per cold start. Never throws: a
 * failure here just means callers fall through to their normal
 * try/catch handling against whatever state the DB is actually in.
 */
export function ensureSchema(): Promise<void> {
  if (!globalForPrisma.prismaSchemaReady) {
    globalForPrisma.prismaSchemaReady = bootstrapSchema().catch((err) => {
      console.error("[prisma] schema self-heal failed:", err);
      // Allow a retry on the next cold start / call rather than caching a rejection forever.
      globalForPrisma.prismaSchemaReady = undefined;
    });
  }
  return globalForPrisma.prismaSchemaReady ?? Promise.resolve();
}
