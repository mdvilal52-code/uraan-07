import { NextRequest, NextResponse } from "next/server";
import { addNewsletter } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Unauthenticated signup — cap per IP so it can't be used to mass-subscribe
// arbitrary addresses or flood the Newsletter table.
const NEWSLETTER_LIMIT = { limit: 8, windowMs: 60 * 60 * 1000, lockoutMs: 30 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`newsletter:${clientIp(req)}`, NEWSLETTER_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { email } = await req.json().catch(() => ({}));
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  try {
    await addNewsletter(email);
  } catch (err) {
    console.error("[api] newsletter failed:", err);
  }
  return NextResponse.json({ ok: true });
}
