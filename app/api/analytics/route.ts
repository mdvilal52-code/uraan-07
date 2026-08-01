import { NextResponse } from "next/server";
import { analytics } from "@/lib/db";
import { revenueSeries } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ...analytics(), revenueSeries });
}
