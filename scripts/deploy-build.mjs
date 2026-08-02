/**
 * Build script for serverless hosts (Vercel) — resilient to how the
 * Postgres provider named the connection string.
 *
 * Neon / Vercel Postgres integrations expose the URL under a variety of
 * names (DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL,
 * DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING …). We resolve whichever
 * exists, use a DIRECT (non-pooled) URL for migrations (pooled PgBouncer
 * connections don't support the advisory locks `migrate` needs), and a
 * pooled URL for the app itself.
 */
import { execSync } from "node:child_process";
import path from "node:path";

// Ensure locally-installed CLIs (prisma, next) resolve whether this script
// is invoked via `npm run` or directly with `node`.
const binPath = path.join(process.cwd(), "node_modules", ".bin");
process.env.PATH = `${binPath}${path.delimiter}${process.env.PATH ?? ""}`;

const POOLED_KEYS = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

const DIRECT_KEYS = [
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "DIRECT_URL",
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
];

const firstSet = (keys) => {
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return "";
};

const pooled = firstSet(POOLED_KEYS);
const direct = firstSet(DIRECT_KEYS) || pooled;

function run(cmd, url, { optional = false } = {}) {
  console.log(`\n▶ ${cmd}`);
  // Only override DATABASE_URL when we actually resolved one, so a missing
  // value never clobbers a .env-provided URL for local runs.
  const env = url ? { ...process.env, DATABASE_URL: url } : { ...process.env };
  try {
    execSync(cmd, { stdio: "inherit", env });
  } catch (err) {
    if (optional) {
      console.log(`  (non-fatal, continuing) → ${cmd}`);
    } else {
      throw err;
    }
  }
}

// Prisma Client generation never needs a live DB.
run("prisma generate", pooled);

if (pooled) {
  // Apply migrations over a direct connection, then seed once (best-effort).
  run("prisma migrate deploy", direct);
  run("npm run db:seed", direct, { optional: true });
} else {
  console.warn(
    "\n⚠️  No database URL found in the environment " +
      `(looked for: ${POOLED_KEYS.join(", ")}).\n` +
      "   Set DATABASE_URL in your host's Environment Variables and redeploy.\n" +
      "   Building anyway — data-driven pages will be empty until it's set.\n",
  );
}

run("next build", pooled);
