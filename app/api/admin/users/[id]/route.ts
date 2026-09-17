import { NextRequest, NextResponse } from "next/server";
import { setUserRole, deleteUserAccount } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const role = body.role === "admin" ? "admin" : body.role === "customer" ? "customer" : null;
  if (!role) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const result = await setUserRole(gate.id, params.id, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const result = await deleteUserAccount(gate.id, params.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
