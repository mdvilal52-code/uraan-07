import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const product = getProduct(params.id);
  if (!product)
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  const product = updateProduct(params.id, body);
  if (!product)
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ok = deleteProduct(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
