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

export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
