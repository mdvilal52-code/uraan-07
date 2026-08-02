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
