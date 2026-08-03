import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Check a coupon code against the current (server-priced) subtotal. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const subtotal = Number(body.subtotal);

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ ok: false, error: "سلّة غير صالحة" }, { status: 400 });
  }

  const result = await validateCoupon(code, subtotal);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
