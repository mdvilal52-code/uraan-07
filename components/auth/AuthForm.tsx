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
    setError("");
    setLoading(true);
    const res = isLogin
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/profile");
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

      <form onSubmit={submit} method="post" className="space-y-3">
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
          disabled={loading}
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
          href={isLogin ? "/register" : "/login"}
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
