import { NextResponse } from "next/server";
import { listUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  return NextResponse.json({ users: await listUsers() });
}
