import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTwoFactorLogin, createSession, publicUser } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, TWOFACTOR_PENDING_COOKIE } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Keyed on the pending token itself (an unguessable randomBytes(32) value,
// like a Session token) rather than IP: scopes the budget to one login
// attempt instead of a shared office/NAT IP, and minting a fresh token
// already required a correct password, which the login route's own limit
// throttles.
const VERIFY_LIMIT = { limit: 5, windowMs: 5 * 60 * 1000, lockoutMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const pendingToken = cookies().get(TWOFACTOR_PENDING_COOKIE)?.value;

  const rl = checkRateLimit(`2fa:${pendingToken ?? "none"}`, VERIFY_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !code) {
    return NextResponse.json({ error: "Please enter your code" }, { status: 400 });
  }

  try {
    const result = await verifyTwoFactorLogin(pendingToken, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    const token = await createSession(result.user.id);
    const res = NextResponse.json({ user: publicUser(result.user) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    res.cookies.delete(TWOFACTOR_PENDING_COOKIE);
    return res;
  } catch (err) {
    console.error("[api] 2fa verify failed:", err);
    return NextResponse.json(
      { error: "Unable to sign in right now, please try again." },
      { status: 500 },
    );
  }
}
