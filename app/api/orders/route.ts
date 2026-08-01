import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, listOrders, getUserByToken } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import type { CartLine } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: CartLine[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
  }

  const user = getUserByToken(cookies().get(SESSION_COOKIE)?.value);

  const order = createOrder({
    customer: body.customer || user?.name || "زائر",
    email: body.email || user?.email || "guest@example.com",
    lines: items,
  });

  return NextResponse.json({ order }, { status: 201 });
}
