"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";

const MIN_PASSWORD_LENGTH = 8;
/** Shape of every token this app issues: randomBytes(32).toString("hex"). */
const TOKEN_SHAPE = /^[0-9a-f]{64}$/i;

export function ResetPasswordForm() {
  // Read the token from the URL at mount rather than via useSearchParams —
  // matches AuthForm's ?next= handling, which reads window.location.search
  // directly so these pages don't need a Suspense boundary.
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ isAdmin: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // ignore double-submits (Enter + click)
    setError("");

    // Confirmation only needs checking client-side — the server
    // independently validates newPassword alone (no confirm field sent).
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to reset the password, please try again.");
        return;
      }
      setResult({ isAdmin: Boolean(data.isAdmin) });
    } catch {
      setError("Unable to reach the server — please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // Still resolving ?token= from the URL on first client render.
  if (token === null) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-5 py-6">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  // No token, or it isn't shaped like one this app ever issues — never
  // even show the password form.
  if (!token || !TOKEN_SHAPE.test(token)) {
    return (
      <div className="px-5 py-6">
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <h1 className="font-sans text-lg font-bold text-ink">
            Invalid or Expired Link
          </h1>
          <p className="text-sm text-ink-muted">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link href="/forgot-password" className="btn-forest mt-4 w-full">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    const loginHref = result.isAdmin ? "/login?next=/admin" : "/login";
    return (
      <div className="px-5 py-6">
        <div className="card flex flex-col items-center gap-2 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-forest-500" />
          <h1 className="font-sans text-lg font-bold text-ink">Password Updated</h1>
          <p className="text-sm text-ink-muted">
            Your password has been changed. Please sign in with your new password.
          </p>
          <Link href={loginHref} className="btn-forest mt-4 w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <div>
        <div className="mb-6 flex flex-col items-center text-center">
          <LotusMark className="h-14 w-14" />
          <h1 className="mt-3 font-sans text-2xl font-extrabold text-ink">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter a new password for your account.
          </p>
        </div>

        <form onSubmit={submit} method="post" className="space-y-3">
          <PasswordField
            label="New Password"
            placeholder="••••••••"
            autoComplete="new-password"
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            value={password}
            onChange={setPassword}
          />
          <span className="-mt-2 block text-xs text-ink-faint">
            At least {MIN_PASSWORD_LENGTH} characters
          </span>
          <PasswordField
            label="Confirm New Password"
            placeholder="••••••••"
            autoComplete="new-password"
            show={show}
            onToggleShow={() => setShow((s) => !s)}
            value={confirm}
            onChange={setConfirm}
          />

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
            Reset Password
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link href="/login" className="font-bold text-clay-500">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  show,
  onToggleShow,
  value,
  onChange,
  ...props
}: {
  label: string;
  show: boolean;
  onToggleShow: () => void;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-soft">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
        <Lock className="h-4 w-4 text-ink-muted" />
        <input
          {...props}
          type={show ? "text" : "password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-4 w-4 text-ink-muted" />
          ) : (
            <Eye className="h-4 w-4 text-ink-muted" />
          )}
        </button>
      </div>
    </label>
  );
}
