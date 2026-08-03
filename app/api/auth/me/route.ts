import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, publicUser, updateUserName } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await getUserByToken(token);
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

export async function PATCH(req: NextRequest) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await getUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: "يرجى تسجيل الدخول" }, { status: 401 });
  }
  const { name } = await req.json().catch(() => ({}));
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "يرجى إدخال اسم صالح" }, { status: 400 });
  }
  const updated = await updateUserName(user.id, name);
  if (!updated) {
    return NextResponse.json(
      { error: "تعذّر تحديث الاسم حاليًا، حاول لاحقًا." },
      { status: 500 },
    );
  }
  return NextResponse.json({ user: publicUser(updated) });
}
