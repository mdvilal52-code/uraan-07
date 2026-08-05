"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";
import { useAuth } from "@/context/AuthContext";

/** Only allow a same-site absolute path as a redirect target — never an
 *  external URL (`//evil.com`, `https://…`) or any non-path value. */
function sanitizeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

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
  // Flips true only after React has hydrated on the client. The submit button
  // stays disabled until then — and with no enabled submit control the browser
  // cannot natively submit the form (neither a click nor Enter). That closes
  // the pre-hydration window this form used to have: a tap before the JS loaded
  // fired a raw browser submit at the page route (which has no POST handler, so
  // it just reloaded the page — silently dropping the typed input and creating
  // no account, the confusing "nothing happened, try again" that preceded the
  // eventual profile redirect). Submission now goes through submit() only, which
  // always preventDefault()s, so it can never leave through the browser.
  const [mounted, setMounted] = useState(false);
  // The `?next=/path` return target (e.g. a guest tapped "Buy Now" and was
  // routed through sign-in). Captured once on mount from the URL — not via
  // useSearchParams — so these pages stay statically rendered. It drives both
  // the post-auth redirect and the login↔register cross-link, so the return
  // target survives the hop between the two auth screens instead of being
  // dropped, which is what used to strand a new customer on /profile mid-order
  // instead of returning them to checkout.
  const [nextParam, setNextParam] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setNextParam(
      sanitizeNext(new URLSearchParams(window.location.search).get("next")),
    );
  }, []);

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
      // Honour the return target captured on mount; default to the profile.
      router.push(nextParam ?? "/profile");
    } catch {
      // login()/register() resolve to { error } rather than throwing, but guard
      // anyway so an unexpected exception can never leave the button spinning
      // or surface as an unhandled rejection in the console.
      setError("تعذّر إتمام العملية، حاولي مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 py-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <LotusMark className="h-14 w-14" />
        <h1 className="mt-3 font-arabic text-2xl font-extrabold text-ink">
          {isLogin ? "أهلًا بعودتكِ" : "إنشاء حساب جديد"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isLogin
            ? "سجّلي الدخول لمتابعة التسوّق."
            : "انضمّي إلى عائلة أريانا واستمتعي بمزايا حصرية."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {!isLogin && (
          <IconField
            icon={User}
            label="الاسم الكامل"
            placeholder="نورة القحطاني"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <IconField
          icon={Mail}
          label="البريد الإلكتروني"
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
              كلمة المرور
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
                aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
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
              8 أحرف على الأقل
            </span>
          )}
        </div>

        {isLogin && (
          <div className="flex justify-end">
            <Link href="#" className="text-xs font-semibold text-clay-500">
              نسيتِ كلمة المرور؟
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
          disabled={loading || !mounted}
          className="btn-forest w-full disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="hr-gold flex-1" />
        <span className="text-xs text-ink-muted">أو</span>
        <span className="hr-gold flex-1" />
      </div>

      <Link href="/shop" className="btn-outline w-full">
        المتابعة كضيف
      </Link>

      <p className="mt-6 text-center text-sm text-ink-muted">
        {isLogin ? "ليس لديكِ حساب؟ " : "لديكِ حساب بالفعل؟ "}
        <Link
          href={`${isLogin ? "/register" : "/login"}${
            nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""
          }`}
          className="font-bold text-clay-500"
        >
          {isLogin ? "أنشئي حسابًا" : "سجّلي الدخول"}
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
