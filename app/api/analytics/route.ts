import { NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { revenueSeries } from "@/lib/analytics";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Revenue, order counts and customer totals are business-sensitive —
// admin-only.
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  return NextResponse.json({ ...(await analytics()), revenueSeries });
}
