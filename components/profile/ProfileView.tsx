"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  UserCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/currency";

const menu = [
  { icon: Package, label: "طلباتي", href: "/profile" },
  { icon: Heart, label: "المفضّلة", href: "/wishlist" },
  { icon: MapPin, label: "عناويني", href: "/profile" },
  { icon: CreditCard, label: "طرق الدفع", href: "/profile" },
  { icon: Bell, label: "الإشعارات", href: "/profile" },
  { icon: Settings, label: "الإعدادات", href: "/profile" },
];

export function ProfileView() {
  const { user, loading, logout } = useAuth();
  const { count: wishCount } = useWishlist();
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink-muted">
        <Loader2 className="h-7 w-7 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <UserCircle className="h-16 w-16 text-cream-400" />
        <h2 className="mt-4 font-arabic text-lg font-bold text-ink">
          مرحبًا بكِ في أريانا
        </h2>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          سجّلي الدخول أو أنشئي حسابًا لمتابعة طلباتك وتفضيلاتك.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Link href="/login" className="btn-forest w-full">
            تسجيل الدخول
          </Link>
          <Link href="/register" className="btn-outline w-full">
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="px-5 pb-2 pt-5">
        <div className="overflow-hidden rounded-3xl bg-forest-gradient p-5 text-cream-50">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-gradient font-arabic text-2xl font-extrabold text-forest-800">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-arabic text-xl font-bold text-cream-50">
                {user.name}
              </h1>
              <p className="text-sm text-cream-200/80">{user.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-forest-600/70 px-2 py-0.5 text-[0.65rem] font-bold text-gold-200">
                <ShieldCheck className="h-3 w-3" /> عضوة أريانا
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "الطلبات", value: "0" },
              { label: "المفضّلة", value: String(wishCount) },
              { label: "الإنفاق", value: formatPrice(0) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-forest-600/40 py-2">
                <p className="font-arabic text-base font-extrabold text-gold-200">
                  {s.value}
                </p>
                <p className="text-[0.66rem] text-cream-200/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-3">
        <div className="card divide-y divide-cream-200 overflow-hidden">
          {menu.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-cream-100"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-gold-500">
                <m.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 font-arabic text-sm font-bold text-ink">
                {m.label}
              </span>
              <ChevronLeft className="h-4 w-4 text-ink-faint" />
            </Link>
          ))}
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 py-3.5 text-sm font-bold text-clay-500 shadow-card-soft"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </section>
    </>
  );
}
