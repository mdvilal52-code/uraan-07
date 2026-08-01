import { NextRequest, NextResponse } from "next/server";
import { priceCart } from "@/lib/db";
import type { CartLine } from "@/types";

export const dynamic = "force-dynamic";

/** Price a cart server-side (products are the source of truth for prices). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({ items: [] as CartLine[] }));
  const items: CartLine[] = Array.isArray(body.items) ? body.items : [];
  return NextResponse.json(await priceCart(items));
}
