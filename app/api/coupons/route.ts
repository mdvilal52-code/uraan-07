import { NextRequest, NextResponse } from "next/server";
import { listCoupons, createCoupon } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ coupons: await listCoupons() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = await createCoupon(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ coupon: result.coupon }, { status: 201 });
}
