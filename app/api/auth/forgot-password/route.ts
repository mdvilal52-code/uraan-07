import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/db";
import { buildPasswordResetEmail, sendEmail } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Two independent buckets: per IP (broad abuse) and per email (targeted
// flooding of one inbox from rotating IPs) — mirrors the login route's
// per-IP+email approach in lib/rateLimit usage elsewhere in this app.
const IP_LIMIT = { limit: 8, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 };
const EMAIL_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 };

// Identical wording and shape regardless of whether the account exists —
// the whole point is that this response can never be used to enumerate
// registered emails.
const GENERIC_RESPONSE = {
  message: "If an account exists for this email, a password reset link has been sent.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const ipRl = checkRateLimit(`forgot-password:ip:${clientIp(req)}`, IP_LIMIT);
  if (!ipRl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipRl.retryAfter) } },
    );
  }
  const emailRl = checkRateLimit(`forgot-password:email:${email}`, EMAIL_LIMIT);
  if (!emailRl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailRl.retryAfter) } },
    );
  }

  try {
    // Scoped to "customer" — this endpoint can never mint (or even
    // acknowledge the existence of) a token for an admin account. The
    // admin-panel forgot-password page uses a separate, admin-scoped
    // endpoint: app/api/admin/auth/forgot-password.
    const result = await createPasswordResetToken(email, "customer");
    if (result) {
      const resetUrl = `${SITE_URL}/reset-password?token=${result.token}`;
      const { subject, html, text } = buildPasswordResetEmail({
        name: result.user.name,
        resetUrl,
        expiresInMinutes: Math.round(PASSWORD_RESET_TOKEN_TTL_MS / 60_000),
        isAdmin: false,
      });
      await sendEmail({ to: result.user.email, subject, html, text }).catch((err) => {
        console.error("[api] forgot-password email send failed:", err);
      });
    }
  } catch (err) {
    console.error("[api] forgot-password failed:", err);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
