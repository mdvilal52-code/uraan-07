import { NextRequest, NextResponse } from "next/server";
import { listProducts, createProduct } from "@/lib/db";

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
  const body = await req.json().catch(() => ({}));
  if (!body.name) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }
  const product = await createProduct(body);
  return NextResponse.json({ product }, { status: 201 });
}
