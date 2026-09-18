import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProduct, updateProduct, deleteProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/** Product pages + home are ISR-cached — refresh them after any mutation
    so admin edits go live immediately. */
function revalidateProduct(id: string) {
  revalidatePath(`/product/${id}`);
  revalidatePath("/");
}

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const product = await getProduct(params.id);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const result = await updateProduct(params.id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.notFound ? 404 : 400 },
    );
  }
  revalidateProduct(params.id);
  return NextResponse.json({ product: result.product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const ok = await deleteProduct(params.id);
  if (ok) revalidateProduct(params.id);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
