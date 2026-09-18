import { NextRequest, NextResponse } from "next/server";
import { deleteCoupon, updateCoupon } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const result = await updateCoupon(params.code, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.notFound ? 404 : 400 },
    );
  }
  return NextResponse.json({ coupon: result.coupon });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const ok = await deleteCoupon(params.code);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
