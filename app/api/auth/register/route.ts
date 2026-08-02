import { NextRequest, NextResponse } from "next/server";
import { createUser, createSession, publicUser } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json(
      { error: "يرجى إدخال البريد وكلمة المرور" },
      { status: 400 },
    );
  }
  try {
    const result = await createUser({ name, email, password });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const token = await createSession(result.user.id);
    const res = NextResponse.json({ user: publicUser(result.user) });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("[api] register failed:", err);
    return NextResponse.json(
      { error: "تعذّر إنشاء الحساب حاليًا، حاول لاحقًا." },
      { status: 500 },
    );
  }
}
