import { NextRequest, NextResponse } from "next/server";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const product = await getProduct(params.id);
  if (!product)
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => ({}));
  const product = await updateProduct(params.id, body);
  if (!product)
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const ok = await deleteProduct(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
