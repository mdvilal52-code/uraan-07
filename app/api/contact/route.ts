import { NextRequest, NextResponse } from "next/server";
import { addContact } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json().catch(() => ({}));
  if (!name || !email || !message) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }
  try {
    const saved = await addContact({ name, email, message });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (err) {
    console.error("[api] contact failed:", err);
    return NextResponse.json({ ok: true });
  }
}
