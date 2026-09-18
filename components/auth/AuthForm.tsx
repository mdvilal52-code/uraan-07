"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";
import { useAuth } from "@/context/AuthContext";

/** Resolve a post-auth `?next=` target, rejecting anything that isn't a
 *  same-origin path (open-redirect guard — see call site for why a plain
 *  string-prefix check isn't safe here). */
function safeNextPath(raw: string | null): string {
  if (!raw) return "/profile";
  try {
    const resolved = new URL(raw, window.location.origin);
    if (resolved.origin === window.location.origin) {
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    }
  } catch {
    // fall through to the default below
  }
  return "/profile";
}

export function AuthForm({
  mode,
  variant = "customer",
}: {
  mode: "login" | "register";
  /** "admin" drops the customer shopping chrome (guest browsing, account
   *  creation) for the admin-area login flow — same underlying auth logic,
   *  just a framing that doesn't imply this is a storefront account. */
  variant?: "customer" | "admin";
}) {
  const router = useRouter();
  const { login, verifyTwoFactor, register } = useAuth();
  const isLogin = mode === "login";
  const isAdmin = variant === "admin";

  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"credentials" | "code">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToNext() {
    // Honour a ?next=/path return target (e.g. guest tapped "Buy Now" and was
    // sent here). Read it at submit time so these statically-rendered pages
    // don't need useSearchParams. Only allow same-site paths — resolved
    // through URL (not a string prefix check) so a backslash-prefixed
    // value like "/\evil.com" can't be parsed as a protocol-relative
    // redirect to another origin (WHATWG URL treats "\" like "/" for
    // http(s), so "/\evil.com" would otherwise resolve to //evil.com).
    const rawNext = new URLSearchParams(window.location.search).get("next");
    router.push(safeNextPath(rawNext));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // ignore double-submits (Enter + click)
    setError("");
    setLoading(true);
    try {
      const res = isLogin
        ? await login(email, password)
        : await register(name, email, password);
      if (res.error) {
        setError(res.error);
        return;
      }
      // Password (and name/email, on register) were correct, but the account
      // has 2FA enabled — no session exists yet, so switch to the code step
      // instead of navigating away.
      if ("requires2FA" in res && res.requires2FA) {
        setStage("code");
        return;
      }
      goToNext();
    } catch {
      // login()/register() resolve to { error } rather than throwing, but guard
      // anyway so an unexpected exception can never leave the button spinning
      // or surface as an unhandled rejection in the console.
      setError("Unable to complete the request, please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await verifyTwoFactor(code);
      if (res.error) {
        setError(res.error);
        return;
      }
      goToNext();
    } catch {
      setError("Unable to complete the request, please try again.");
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
      <div className={isAdmin ? "card w-full max-w-sm p-8" : undefined}>
      <div className="mb-6 flex flex-col items-center text-center">
        <LotusMark className="h-14 w-14" />
        <h1 className="mt-3 font-sans text-2xl font-extrabold text-ink">
          {stage === "code"
            ? "Two-Factor Authentication"
            : isAdmin
              ? "Admin Login"
              : isLogin
                ? "Welcome Back"
                : "Create a New Account"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {stage === "code"
            ? "Enter the 6-digit code from your authenticator app, or a backup code."
            : isAdmin
              ? "Sign in to access the admin dashboard."
              : isLogin
                ? "Sign in to continue shopping."
                : "Join the Ariana family and enjoy exclusive benefits."}
        </p>
      </div>

      {stage === "code" ? (
        <form onSubmit={submitCode} method="post" className="space-y-3">
          <IconField
            icon={Lock}
            label="Authentication Code"
            placeholder="123456"
            name="code"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
            Verify
          </button>
          <button
            type="button"
            onClick={() => {
              setStage("credentials");
              setCode("");
              setError("");
            }}
            className="w-full text-center text-xs font-semibold text-clay-500"
          >
            Back to login
          </button>
        </form>
      ) : (
        <form onSubmit={submit} method="post" className="space-y-3">
          {!isLogin && (
            <IconField
              icon={User}
              label="Full Name"
              placeholder="Noura Al Qahtani"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <IconField
            icon={Mail}
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-soft">
                Password
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
                <Lock className="h-4 w-4 text-ink-muted" />
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  required
                  minLength={isLogin ? undefined : 8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
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
            {!isLogin && (
              <span className="mt-1 block text-xs text-ink-faint">
                At least 8 characters
              </span>
            )}
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <Link href="#" className="text-xs font-semibold text-clay-500">
                Forgot your password?
              </Link>
            </div>
          )}

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
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      )}

      {!isAdmin && stage === "credentials" && (
        <>
          <div className="my-5 flex items-center gap-3">
            <span className="hr-gold flex-1" />
            <span className="text-xs text-ink-muted">or</span>
            <span className="hr-gold flex-1" />
          </div>

          <Link href="/shop" className="btn-outline w-full">
            Continue as Guest
          </Link>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-bold text-clay-500"
            >
              {isLogin ? "Create one" : "Login"}
            </Link>
          </p>
        </>
      )}
      </div>
    </div>
  );
}

function IconField({
  icon: Icon,
  label,
  ...props
}: {
  icon: typeof Mail;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-soft">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
        <Icon className="h-4 w-4 text-ink-muted" />
        <input
          {...props}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
      </div>
    </label>
  );
}
