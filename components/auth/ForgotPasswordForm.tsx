"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";

export function ForgotPasswordForm({
  variant = "customer",
}: {
  /** "admin" points the form at the admin-scoped endpoint and drops the
   *  customer shopping chrome, mirroring AuthForm's own variant prop. */
  variant?: "customer" | "admin";
}) {
  const isAdmin = variant === "admin";
  const loginHref = isAdmin ? "/login?next=/admin" : "/login";

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // ignore double-submits (Enter + click)
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        isAdmin ? "/api/admin/auth/forgot-password" : "/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to process the request, please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Unable to reach the server — please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={
        isAdmin
          ? "grid min-h-screen place-items-center bg-cream-200 px-5"
          : "px-5 py-6"
      }
    >
      {sent ? (
        <div
          className={
            isAdmin
              ? "card flex w-full max-w-sm flex-col items-center gap-2 p-8 text-center"
              : "card flex flex-col items-center gap-2 p-8 text-center"
          }
        >
          <CheckCircle2 className="h-12 w-12 text-forest-500" />
          <h1 className="font-sans text-lg font-bold text-ink">Check Your Email</h1>
          <p className="text-sm text-ink-muted">
            If an account exists for that email, we&apos;ve sent a link to reset the
            password. The link expires in 30 minutes.
          </p>
          <Link href={loginHref} className="btn-outline mt-4 w-full">
            Back to Login
          </Link>
        </div>
      ) : (
        <div className={isAdmin ? "card w-full max-w-sm p-8" : undefined}>
          <div className="mb-6 flex flex-col items-center text-center">
            <LotusMark className="h-14 w-14" />
            <h1 className="mt-3 font-sans text-2xl font-extrabold text-ink">
              {isAdmin ? "Admin Password Reset" : "Forgot Password"}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Enter the email on your {isAdmin ? "admin " : ""}account and we&apos;ll
              send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={submit} method="post" className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-soft">
                Email Address
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
                <Mail className="h-4 w-4 text-ink-muted" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-forest w-full disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Remembered your password?{" "}
            <Link href={loginHref} className="font-bold text-clay-500">
              Back to Login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
