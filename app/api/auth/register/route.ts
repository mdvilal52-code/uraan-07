import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession, publicUser } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Cap sign-ups per IP so the endpoint can't be used to spam accounts.
const REGISTER_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
  lockoutMs: 30 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`register:${clientIp(req)}`, REGISTER_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json(
      { error: "Please enter your email and password" },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  try {
    const result = await createUser({ name, email, password });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const token = await createSession(result.user.id);
    const res = NextResponse.json({ user: publicUser(result.user) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("[api] register failed:", err);
    return NextResponse.json(
      { error: "Unable to create the account right now, please try again." },
      { status: 500 },
    );
  }
}
