import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// This endpoint is unauthenticated and its error messages distinguish
// "doesn't exist" from "expired"/"exhausted"/"needs a bigger cart" — without
// a limit here, an attacker could sweep codes to harvest every live coupon.
// Generous enough that a customer retrying a mistyped code never hits it.
const VALIDATE_LIMIT = {
  limit: 20,
  windowMs: 10 * 60 * 1000,
  lockoutMs: 10 * 60 * 1000,
};

/** Check a coupon code against the current (server-priced) subtotal. */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`coupon-validate:${clientIp(req)}`, VALIDATE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const subtotal = Number(body.subtotal);

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ ok: false, error: "Invalid cart" }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotal);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
