import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken, PASSWORD_RESET_TOKEN_TTL_MS } from "@/lib/db";
import { buildPasswordResetEmail, sendEmail } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/* ============================================================
   Admin-panel forgot-password — deliberately a separate route (and
   separate rate-limit buckets) from /api/auth/forgot-password, even
   though both ultimately call the same lib/db.ts helper. Keeping it
   separate means:
     - the admin panel's form never shares fate with customer-endpoint
       abuse/lockouts, and vice versa;
     - createPasswordResetToken() is called with role: "admin" here,
       which makes it structurally impossible for this endpoint to
       mint (or even acknowledge the existence of) a token for a
       customer account — the one-way boundary Phase 3 requires.
   ============================================================ */

// Slightly tighter than the customer endpoint — the admin panel has far
// fewer legitimate callers than the storefront.
const IP_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 };
const EMAIL_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000, lockoutMs: 60 * 60 * 1000 };

const GENERIC_RESPONSE = {
  message: "If an account exists for this email, a password reset link has been sent.",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const ipRl = checkRateLimit(`admin-forgot-password:ip:${clientIp(req)}`, IP_LIMIT);
  if (!ipRl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipRl.retryAfter) } },
    );
  }
  const emailRl = checkRateLimit(`admin-forgot-password:email:${email}`, EMAIL_LIMIT);
  if (!emailRl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailRl.retryAfter) } },
    );
  }

  try {
    const result = await createPasswordResetToken(email, "admin");
    if (result) {
      const resetUrl = `${SITE_URL}/reset-password?token=${result.token}`;
      const { subject, html, text } = buildPasswordResetEmail({
        name: result.user.name,
        resetUrl,
        expiresInMinutes: Math.round(PASSWORD_RESET_TOKEN_TTL_MS / 60_000),
        isAdmin: true,
      });
      await sendEmail({ to: result.user.email, subject, html, text }).catch((err) => {
        console.error("[api] admin forgot-password email send failed:", err);
      });
    }
  } catch (err) {
    console.error("[api] admin forgot-password failed:", err);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
