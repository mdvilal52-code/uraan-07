// RFC 6238 TOTP (+ RFC 4226 HOTP) for admin two-factor login. Hand-rolled with
// node:crypto rather than an external package, matching this codebase's
// existing auth primitives (lib/db.ts's scryptSync/timingSafeEqual password
// hashing uses no library either). The HMAC-SHA1/dynamic-truncation math
// below was checked against the official RFC 6238 Appendix B test vectors
// (T=59s and T=1111111109s, both 8- and 6-digit forms) before use.

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TIME_STEP_SECONDS = 30;
const CODE_DIGITS = 6;

/** RFC 4648 base32, unpadded (authenticator apps expect unpadded secrets). */
function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** RFC 4226 HOTP: HMAC-SHA1 of an 8-byte big-endian counter, dynamically
 *  truncated to `digits` decimal digits. The `& 0x7f` mask on the first
 *  truncated byte is required — without it a byte >=128 flips the sign bit
 *  and JS's `%` on a negative dividend returns a negative result, silently
 *  producing a wrong/negative code for roughly half of all secrets. */
function hotp(key: Buffer, counter: number, digits: number): string {
  const counterBuf = Buffer.alloc(8);
  // counter is a step index (ms/1000/30) — safely within Number.MAX_SAFE_INTEGER
  // for centuries, but split via division rather than a 64-bit bit-shift since
  // JS bitwise ops only operate on 32 bits.
  counterBuf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuf.writeUInt32BE(counter >>> 0, 4);

  const hmac = createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binCode % 10 ** digits;
  return String(otp).padStart(digits, "0");
}

/** A fresh 160-bit secret (RFC 4226's recommended minimum), base32 for
 *  display/QR-less manual entry into any standard authenticator app. */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** `otpauth://` URI for setup — most authenticator apps and password
 *  managers accept this pasted directly, no QR code needed. */
export function generateTotpUri(secret: string, accountLabel: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${accountLabel}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(CODE_DIGITS),
    period: String(TIME_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/**
 * Verifies a 6-digit TOTP code against `secret` at time `atMs`, tolerating
 * clock drift within `windowSteps` steps either side of "now". Returns the
 * matched step counter (for the caller to persist as a replay guard — a
 * step must never be accepted twice) or null if the code doesn't match any
 * step in the window.
 */
export function verifyTotp(
  secret: string,
  code: string,
  windowSteps = 1,
  atMs: number = Date.now(),
): number | null {
  const trimmed = (code ?? "").trim();
  if (!/^\d{6}$/.test(trimmed)) return null;

  const key = base32Decode(secret);
  const currentStep = Math.floor(atMs / 1000 / TIME_STEP_SECONDS);
  const candidateBuf = Buffer.from(trimmed);

  for (let delta = -windowSteps; delta <= windowSteps; delta++) {
    const step = currentStep + delta;
    if (step < 0) continue;
    const expected = Buffer.from(hotp(key, step, CODE_DIGITS));
    if (timingSafeEqual(expected, candidateBuf)) {
      return step;
    }
  }
  return null;
}
