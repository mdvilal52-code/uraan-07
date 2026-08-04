/* ============================================================
   In-memory rate limiting & brute-force lockout.
   ------------------------------------------------------------
   A first line of defence against credential stuffing / brute
   force on the auth endpoints. State is per-process: on a single
   instance it is fully effective; across a horizontally-scaled
   deployment it should be backed by a shared store (e.g. Redis /
   Upstash). It is deliberately dependency-free so it works
   everywhere the app runs.
   ============================================================ */

type Bucket = {
  count: number;
  first: number; // window start (ms)
  lockedUntil?: number; // ms epoch while locked out
};

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow unbounded on a long-lived
// instance. Runs at most once a minute, on access.
let lastSweep = 0;
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    const expired = now - b.first > windowMs && (!b.lockedUntil || b.lockedUntil < now);
    if (expired) buckets.delete(key);
  }
}

export interface RateLimitResult {
  /** True when the request is allowed to proceed. */
  ok: boolean;
  /** Seconds until the caller may retry (only meaningful when !ok). */
  retryAfter: number;
  /** Attempts remaining in the current window before lockout. */
  remaining: number;
}

export interface RateLimitOptions {
  /** Max attempts allowed within the window before lockout. */
  limit: number;
  /** Rolling window length in ms. */
  windowMs: number;
  /** How long to lock the key out once the limit is exceeded, in ms. */
  lockoutMs: number;
}

/**
 * Check-and-consume one attempt for `key`. Call this at the START of a
 * sensitive handler; on a successful outcome (e.g. valid login) call
 * `clearRateLimit(key)` to reset the counter.
 */
export function checkRateLimit(
  key: string,
  opts: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  sweep(now, opts.windowMs);

  let b = buckets.get(key);

  // Locked out?
  if (b?.lockedUntil && b.lockedUntil > now) {
    return {
      ok: false,
      retryAfter: Math.ceil((b.lockedUntil - now) / 1000),
      remaining: 0,
    };
  }

  // Start a fresh window if none exists or the previous one has elapsed.
  if (!b || now - b.first > opts.windowMs) {
    b = { count: 0, first: now };
    buckets.set(key, b);
  }

  b.count += 1;

  if (b.count > opts.limit) {
    b.lockedUntil = now + opts.lockoutMs;
    return {
      ok: false,
      retryAfter: Math.ceil(opts.lockoutMs / 1000),
      remaining: 0,
    };
  }

  return { ok: true, retryAfter: 0, remaining: Math.max(0, opts.limit - b.count) };
}

/** Reset the counter for a key after a successful, legitimate action. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Best-effort client IP from proxy headers. Behind a trusted proxy
 * (Vercel/Render set these) the left-most X-Forwarded-For entry is the
 * client. Falls back to a constant so limiting still applies globally
 * when no IP is available.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
