import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listProducts, createProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const products = await listProducts({
    category: sp.get("category") ?? undefined,
    q: sp.get("q") ?? undefined,
    bestSeller: sp.get("bestSeller") === "true" || undefined,
    newArrival: sp.get("newArrival") === "true" || undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  if (!body.name) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }
  const product = await createProduct(body);
  // Product pages + home are ISR-cached — refresh them so the new product
  // is visible immediately rather than after the next revalidate window.
  revalidatePath(`/product/${product.id}`);
  revalidatePath("/");
  return NextResponse.json({ product }, { status: 201 });
}
