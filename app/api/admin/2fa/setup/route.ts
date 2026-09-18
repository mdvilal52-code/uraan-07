import { NextResponse } from "next/server";
import { initiateTwoFactorSetup } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const result = await initiateTwoFactorSetup(gate.id, gate.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ secret: result.secret, uri: result.uri });
}
