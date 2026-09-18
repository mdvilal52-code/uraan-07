export const SESSION_COOKIE = "ariana_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/** Carries a 2FA challenge token between "password correct" and "code
 *  verified" — never a real session, so a much shorter lifetime than
 *  SESSION_COOKIE (matches TWOFACTOR_PENDING_MAX_AGE_MS in lib/db.ts). */
export const TWOFACTOR_PENDING_COOKIE = "ariana_2fa_pending";

export const TWOFACTOR_PENDING_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 5, // 5 minutes
};
