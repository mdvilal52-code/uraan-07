import { NextRequest, NextResponse } from "next/server";
import { listCoupons, createCoupon } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Listing every coupon (codes, limits, usage) is administrative data —
// exposing it publicly would leak working discount codes.
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  return NextResponse.json({ coupons: await listCoupons() });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const result = await createCoupon(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ coupon: result.coupon }, { status: 201 });
}
