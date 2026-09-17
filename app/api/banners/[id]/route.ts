import { NextRequest, NextResponse } from "next/server";
import { deleteBanner } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const ok = await deleteBanner(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
