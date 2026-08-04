import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserByToken, publicUser } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

/* ============================================================
   Centralised server-side authentication / authorization.
   ------------------------------------------------------------
   Every admin page and every mutating admin API funnels through
   these helpers, so the "is this request allowed?" decision lives
   in exactly one place and is enforced on the server — never in
   the browser, and never in middleware alone (Next.js middleware
   has historically been bypassable, e.g. CVE-2025-29927, so it is
   used only as a cheap first redirect, not as the source of truth).
   ============================================================ */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

/** Resolve the signed-in user from the session cookie, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await getUserByToken(token);
  return user ? publicUser(user) : null;
}

/** True when the session belongs to an admin/super-admin. */
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && user.role === "admin" ? user : null;
}

/**
 * Guard for API route handlers. Returns either the authorized admin
 * user or a ready-to-return JSON response (401 unauthenticated /
 * 403 forbidden) — the caller returns it directly:
 *
 *   const gate = await requireAdmin();
 *   if (gate instanceof NextResponse) return gate;
 *   // gate is a SessionUser from here on
 */
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "يجب تسجيل الدخول" },
      { status: 401 },
    );
  }
  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "غير مصرّح لك بالوصول" },
      { status: 403 },
    );
  }
  return user;
}
