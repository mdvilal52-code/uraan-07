import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Shared by both the customer and admin flows — the token itself already
// carries the role boundary (it was only ever minted by one of the two
// role-scoped forgot-password endpoints), so redemption needs no role
// parameter, just the token.
const RESET_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000, lockoutMs: 30 * 60 * 1000 };

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`reset-password:${clientIp(req)}`, RESET_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  // Malformed tokens are rejected before ever reaching the database — a
  // valid token is always exactly 32 random bytes, hex-encoded.
  if (!token || !/^[0-9a-f]{64}$/i.test(token)) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters` },
      { status: 400 },
    );
  }

  try {
    const result = await resetPasswordWithToken(token, newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, isAdmin: result.isAdmin });
  } catch (err) {
    console.error("[api] reset-password failed:", err);
    return NextResponse.json(
      { error: "Unable to reset the password right now, please try again." },
      { status: 500 },
    );
  }
}
