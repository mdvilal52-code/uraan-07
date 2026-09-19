/* ============================================================
   Transactional email.
   ------------------------------------------------------------
   Provider: Resend's HTTP API, called with plain `fetch` — no SDK
   dependency, matching this codebase's existing style of hand-rolling
   small integrations with node/web-platform primitives instead of
   pulling in a package (see lib/totp.ts for the same approach applied
   to 2FA). To switch providers, only sendEmail() needs to change —
   every caller just deals with { to, subject, html, text }.
   ============================================================ */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BRAND_NAME = "Ariana Gems & Jewellery";

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Email provider is not configured — set RESEND_API_KEY and EMAIL_FROM");
    this.name = "EmailNotConfiguredError";
  }
}

/**
 * Sends one transactional email. Throws on failure or missing
 * configuration — callers on a path that must never let delivery
 * outcomes leak to the client (forgot-password, to avoid account
 * enumeration via response differences) should catch this and log,
 * not let it change the HTTP response.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new EmailNotConfiguredError();
    }
    // Local/dev only (never reachable in production, per the check above):
    // no provider is configured, so print the email instead of sending it.
    // This is what makes the reset flow testable end-to-end without a real
    // inbox — the same fallback every mailer library ships for local dev.
    console.info(
      `[email:dev-preview] No RESEND_API_KEY/EMAIL_FROM set — printing instead of sending.\n` +
        `[email:dev-preview] To: ${input.to}\n[email:dev-preview] Subject: ${input.subject}\n\n${input.text}\n`,
    );
    return;
  }

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text }),
  });

  if (!res.ok) {
    // Deliberately not including the response body: some providers echo
    // request fields back in error payloads, and this must never end up
    // carrying anything sensitive into logs.
    throw new Error(`Email provider responded with HTTP ${res.status}`);
  }
}

/**
 * Branded password-reset email content (HTML + plain-text fallback) for
 * either a customer or admin account. `resetUrl` must already be the full,
 * absolute production URL — building it is the caller's job (lib/site.ts).
 */
export function buildPasswordResetEmail(input: {
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
  isAdmin: boolean;
}): { subject: string; html: string; text: string } {
  const { name, resetUrl, expiresInMinutes, isAdmin } = input;
  const safeName = name?.trim() || "there";
  const context = isAdmin ? "Ariana admin account" : "Ariana account";
  const subject = "Reset your password";

  const text = [
    `Hi ${safeName},`,
    ``,
    `We received a request to reset the password for your ${context} (${BRAND_NAME}).`,
    ``,
    `Reset your password using this link (expires in ${expiresInMinutes} minutes):`,
    resetUrl,
    ``,
    `This link can only be used once. If you didn't request this, you can safely ignore this email — your password will not change.`,
    ``,
    `For your security, never share this link with anyone.`,
    ``,
    `— ${BRAND_NAME}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F0E7D6;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0E7D6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#FCFAF5;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px -12px rgba(36,27,18,0.18);">
            <tr>
              <td style="background:linear-gradient(135deg,#E9CE86 0%,#CFA23E 45%,#A5711D 100%);padding:28px 32px;text-align:center;">
                <span style="font-family:Georgia,serif;font-size:20px;font-weight:700;letter-spacing:0.02em;color:#241B12;">${BRAND_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#241B12;">Reset your password</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4A3F33;">
                  Hi ${escapeHtml(safeName)}, we received a request to reset the password for your ${isAdmin ? "admin " : ""}account. Click the button below to choose a new one.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="border-radius:14px;background-color:#204A37;">
                      <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FCFAF5;text-decoration:none;border-radius:14px;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#7A6C5C;">
                  This link expires in ${expiresInMinutes} minutes and can only be used once.
                </p>
                <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#7A6C5C;">
                  If the button doesn't work, copy and paste this URL into your browser:<br />
                  <a href="${resetUrl}" style="color:#A5711D;word-break:break-all;">${resetUrl}</a>
                </p>
                <hr style="border:none;border-top:1px solid #E7DAC2;margin:20px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.6;color:#A99B89;">
                  If you didn't request a password reset, you can safely ignore this email — your password will not be changed. Never share this link with anyone.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
