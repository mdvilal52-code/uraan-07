import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, listOrders, getUserByToken } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import type { CartLine } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  // Orders are personal — scope strictly to the signed-in account so one
  // customer can never see another's purchase history. Guests (no session)
  // have no account to attribute orders to, so they see an empty list.
  const user = await getUserByToken(cookies().get(SESSION_COOKIE)?.value);
  if (!user) return NextResponse.json({ orders: [] });
  return NextResponse.json({ orders: await listOrders({ userId: user.id }) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: CartLine[] = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
  }

  try {
    const user = await getUserByToken(cookies().get(SESSION_COOKIE)?.value);
    const result = await createOrder({
      customer: body.customer || user?.name || "زائر",
      email: body.email || user?.email || "guest@example.com",
      lines: items,
      couponCode: typeof body.couponCode === "string" ? body.couponCode : undefined,
      userId: user?.id,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ order: result.order }, { status: 201 });
  } catch (err) {
    console.error("[api] create order failed:", err);
    return NextResponse.json(
      { error: "تعذّر إتمام الطلب حاليًا، حاول لاحقًا." },
      { status: 500 },
    );
  }
}
