import { NextRequest, NextResponse } from "next/server";
import { confirmTwoFactorSetup } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// A hijacked admin session (without the phone the code comes from) shouldn't
// get unlimited guesses at the 6-digit space while setup is pending.
const CONFIRM_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000, lockoutMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const rl = checkRateLimit(`2fa-confirm:${gate.id}`, CONFIRM_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== "string" || !code) {
    return NextResponse.json({ error: "Please enter the 6-digit code" }, { status: 400 });
  }

  const result = await confirmTwoFactorSetup(gate.id, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ backupCodes: result.backupCodes });
}
