"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";
import { useAuth } from "@/context/AuthContext";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const isLogin = mode === "login";

  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Honour a ?next=/path return target (e.g. guest tapped "Buy Now" and was
      // sent here). Read it at submit time so these statically-rendered pages
      // don't need useSearchParams. Only allow same-site paths.
      const next = new URLSearchParams(window.location.search).get("next");
      const dest =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";
      router.push(dest);
    } catch {
      // login()/register() resolve to { error } rather than throwing, but guard
      // anyway so an unexpected exception can never leave the button spinning
      // or surface as an unhandled rejection in the console.
      setError("Unable to complete the request, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <LotusMark className="h-14 w-14" />
        <h1 className="mt-3 font-sans text-2xl font-extrabold text-ink">
          {isLogin ? "Welcome Back" : "Create a New Account"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isLogin
            ? "Sign in to continue shopping."
            : "Join the Ariana family and enjoy exclusive benefits."}
        </p>
      </div>

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
