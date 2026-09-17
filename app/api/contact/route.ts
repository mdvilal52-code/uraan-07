import { NextRequest, NextResponse } from "next/server";
import { addContact } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Unauthenticated form — cap submissions per IP so it can't be used to
// spam-flood the ContactMessage table.
const CONTACT_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000, lockoutMs: 30 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(`contact:${clientIp(req)}`, CONTACT_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { name, email, message } = await req.json().catch(() => ({}));
  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  try {
    const saved = await addContact({ name, email, message });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error("[api] contact failed:", err);
    return NextResponse.json({ ok: true });
  }
}
