import { NextRequest, NextResponse } from "next/server";
import { listBanners, createBanner } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Banner management is admin-only (no public storefront placement reads
// from this yet, but the list can include scheduled/inactive drafts, so it
// isn't public data).
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  return NextResponse.json({ banners: await listBanners() });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const result = await createBanner(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ banner: result.banner }, { status: 201 });
}
