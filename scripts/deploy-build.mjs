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
import net from "node:net";
import path from "node:path";

// Keep Prisma's CLI output quiet on CI: no "Update available X -> Y" banner
// and no version-check network round-trip during the build. (Set before any
// prisma invocation; respects an explicit override if the host already set it.)
process.env.PRISMA_HIDE_UPDATE_MESSAGE ||= "1";
process.env.CHECKPOINT_DISABLE ||= "1";

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

function run(cmd, url, { optional = false, unsetDbUrl = false } = {}) {
  console.log(`\n▶ ${cmd}`);
  // Only override DATABASE_URL when we actually resolved one, so a missing
  // value never clobbers a .env-provided URL for local runs.
  const env = url ? { ...process.env, DATABASE_URL: url } : { ...process.env };
  if (unsetDbUrl) {
    // The DB is known-unreachable: strip every connection-string variable so
    // nothing in the build can even attempt a connection. An unreachable-but-
    // hanging host (e.g. an IPv6-only address from an IPv4 builder) would
    // otherwise stall page-data collection into Next's 60s worker timeout.
    // Runtime is unaffected — serverless functions read env vars at request
    // time, not from the build environment.
    for (const k of new Set([...POOLED_KEYS, ...DIRECT_KEYS])) delete env[k];
  }
  try {
    execSync(cmd, { stdio: "inherit", env });
    return true;
  } catch (err) {
    if (optional) {
      console.log(`  (non-fatal, continuing) → ${cmd}`);
      return false;
    }
    throw err;
  }
}

/**
 * Quick TCP reachability probe for the database host.
 *
 * On serverless build hosts the DB is frequently *unreachable* at build time —
 * a paused free-tier instance, or (very common with Supabase on Vercel) a
 * DIRECT connection string whose host is IPv6-only while the build runs on
 * IPv4. Letting `migrate` / `db push` / `seed` each discover that themselves
 * dumps three separate `P1001 … Can't reach database server` errors (plus a
 * full seed stack trace) into the build log — alarming noise for a build that
 * still succeeds. A single fast probe lets us skip those steps cleanly with
 * one actionable message instead.
 */
function probeDatabase(url, timeoutMs = 5000) {
  let host;
  let port;
  try {
    const u = new URL(url);
    host = u.hostname;
    port = Number(u.port) || 5432;
  } catch {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

// Prisma Client generation never needs a live DB.
run("prisma generate", pooled);

let dbReachable = false;

if (pooled) {
  const reachable = await probeDatabase(direct);
  dbReachable = reachable;
  if (!reachable) {
    let where = direct;
    try {
      const u = new URL(direct);
      where = `${u.hostname}:${u.port || 5432}`;
    } catch {
      /* keep the raw string */
    }
    console.warn(
      `\n⚠️  Database not reachable at ${where} — skipping migrate / db push / seed.\n` +
        "   The site will still build; data-driven pages populate once the DB is reachable.\n" +
        "   Common cause on Vercel + Supabase: the DIRECT connection (db.<ref>.supabase.co:5432)\n" +
        "   is IPv6-only, but the build runs on IPv4. Use the Supabase POOLER strings instead:\n" +
        "     • App  (DATABASE_URL) → aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true\n" +
        "     • Migr (DIRECT_URL)   → aws-0-<region>.pooler.supabase.com:5432/postgres\n" +
        "   Set them under Vercel → Project → Settings → Environment Variables and redeploy.\n",
    );
  } else {
    // Apply migrations over a direct connection. `migrate deploy` requires the
    // DB's recorded migration history to line up exactly with the migrations
    // folder — on a repo whose history was ever squashed/reset (or a DB
    // provisioned out of band), it errors out and would previously fail the
    // whole build, silently freezing the live site on the last deployment
    // that *did* build. Treat it as optional and fall back to `db push`,
    // which syncs the schema from prisma/schema.prisma directly regardless
    // of migration history — safe here since this project only ever adds
    // tables/columns. (Runtime also has a CREATE-TABLE-IF-NOT-EXISTS safety
    // net in lib/prisma.ts for defense in depth.)
    const migrated = run("prisma migrate deploy", direct, { optional: true });
    if (!migrated) {
      console.warn(
        "\n⚠️  prisma migrate deploy failed (likely migration-history drift) " +
          "— falling back to `prisma db push` to sync the schema directly.\n",
      );
      run("prisma db push --accept-data-loss --skip-generate", direct, {
        optional: true,
      });
    }
    run("npm run db:seed", direct, { optional: true });
  }
} else {
  console.warn(
    "\n⚠️  No database URL found in the environment " +
      `(looked for: ${POOLED_KEYS.join(", ")}).\n` +
      "   Set DATABASE_URL in your host's Environment Variables and redeploy.\n" +
      "   Building anyway — data-driven pages will be empty until it's set.\n",
  );
}

// When the DB is unreachable, build with every connection-string variable
// stripped: pages render from the built-in catalogue (fast, deterministic)
// instead of stalling on doomed connection attempts.
run("next build", dbReachable ? pooled : "", { unsetDbUrl: !dbReachable });
