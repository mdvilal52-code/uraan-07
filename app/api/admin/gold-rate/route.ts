import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { listGoldRates, updateGoldRates, countGoldRateProducts } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const [rates, goldRateProductCount] = await Promise.all([
    listGoldRates(),
    countGoldRateProducts(),
  ]);
  return NextResponse.json({ rates, goldRateProductCount });
}

export async function PUT(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const rates = Array.isArray(body.rates) ? body.rates : [];
  const result = await updateGoldRates(rates, gate.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  // Gold-rate-priced products compute their price live at read time, so a
  // rate change is only visible on already-cached pages once revalidated.
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/product/[id]", "page");
  return NextResponse.json({ rates: result.rates });
}
