import { NextRequest, NextResponse } from "next/server";
import { addNewsletter } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "بريد غير صالح" }, { status: 400 });
  }
  await addNewsletter(email);
  return NextResponse.json({ ok: true });
}
