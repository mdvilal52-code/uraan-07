import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, publicUser } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await getUserByToken(token);
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
