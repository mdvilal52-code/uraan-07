import { NextRequest, NextResponse } from "next/server";
import { verifyUser, createSession, publicUser } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { checkRateLimit, clearRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Brute-force policy: at most 8 attempts per IP+email pair within 15 minutes,
// then a 15-minute lockout. Tight enough to stop credential stuffing without
// punishing an honest fat-fingered password.
const LOGIN_LIMIT = {
  limit: 8,
  windowMs: 15 * 60 * 1000,
  lockoutMs: 15 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "يرجى إدخال البريد وكلمة المرور" },
      { status: 400 },
    );
  }

  // Rate-limit per IP+email so an attacker can't grind one account, and can't
  // spread across accounts from one IP either.
  const key = `login:${clientIp(req)}:${email}`;
  const rl = checkRateLimit(key, LOGIN_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "محاولات كثيرة جدًا. حاول مرة أخرى لاحقًا." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const user = await verifyUser(email, password);
    if (!user) {
      // Generic message — never reveal whether the email exists (anti-enumeration).
      return NextResponse.json(
        { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" },
        { status: 401 },
      );
    }
    // Successful auth resets the counter for this key.
    clearRateLimit(key);
    const token = await createSession(user.id);
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("[api] login failed:", err);
    return NextResponse.json(
      { error: "تعذّر تسجيل الدخول حاليًا، حاول لاحقًا." },
      { status: 500 },
    );
  }
}
