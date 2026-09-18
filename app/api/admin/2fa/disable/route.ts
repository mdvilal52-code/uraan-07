import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { disableTwoFactor } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

const DISABLE_LIMIT = { limit: 8, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const rl = checkRateLimit(`2fa-disable:${gate.id}`, DISABLE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Please enter your password" }, { status: 400 });
  }

  // Re-verifying the password is the step-up check; excluding the caller's
  // own token from the session revoke means the admin doing this isn't
  // immediately logged out by their own request.
  const currentToken = cookies().get(SESSION_COOKIE)?.value;
  const result = await disableTwoFactor(gate.id, password, currentToken);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
