import { NextRequest, NextResponse } from "next/server";
import { verifyUser, createSession, publicUser } from "@/lib/db";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  const user = await verifyUser(email ?? "", password ?? "");
  if (!user) {
    return NextResponse.json(
      { error: "بريد إلكتروني أو كلمة مرور غير صحيحة" },
      { status: 401 },
    );
  }
  const token = await createSession(user.id);
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
