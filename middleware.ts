import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/* ============================================================
   Edge middleware — a cheap FIRST gate for the admin area.
   ------------------------------------------------------------
   It only checks for the presence of a session cookie and bounces
   anonymous visitors to the login page (good UX, avoids rendering
   the admin shell for logged-out users). It is NOT the security
   boundary: the real authorization — verifying the session against
   the database and checking the admin role — happens server-side in
   the admin layout and in every mutating API route. That layering
   means even if middleware is skipped, nothing sensitive is served.
   ============================================================ */

/** Admin sub-routes that must stay reachable while signed out — the whole
 *  point of a forgot-password flow. Kept in sync with the equivalent guard
 *  in app/admin/layout.tsx (the actual security boundary; this is just the
 *  cheap first redirect — see the file header above). */
const PUBLIC_ADMIN_PATHS = new Set(["/admin/forgot-password"]);

export function middleware(req: NextRequest) {
  // This header is an internal signal from middleware to the admin layout
  // (see app/admin/layout.tsx), never something a request gets to set for
  // itself — a client sending it directly must never be able to skip the
  // layout's real getAdminUser() check. Strip any client-supplied value
  // FIRST, unconditionally, before the one branch below that sets it.
  // Every return in this function must forward these scrubbed headers, not
  // just the branch that sets the header — otherwise a signed-in non-admin
  // hitting e.g. /admin/products with a forged x-admin-public-route header
  // would sail through untouched on the plain NextResponse.next() path.
  const headers = new Headers(req.headers);
  headers.delete("x-admin-public-route");

  if (PUBLIC_ADMIN_PATHS.has(req.nextUrl.pathname)) {
    headers.set("x-admin-public-route", "1");
    return NextResponse.next({ request: { headers } });
  }

  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
