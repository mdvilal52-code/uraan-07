import type { Metadata } from "next";
import Link from "next/link";
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
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = {
  title: "حسابي",
  description: "إدارة حسابك وطلباتك وتفضيلاتك.",
};

const menu = [
  { icon: Package, label: "طلباتي", href: "/profile", badge: "3" },
  { icon: Heart, label: "المفضّلة", href: "/wishlist" },
  { icon: MapPin, label: "عناويني", href: "/profile" },
  { icon: CreditCard, label: "طرق الدفع", href: "/profile" },
  { icon: Bell, label: "الإشعارات", href: "/profile" },
  { icon: Settings, label: "الإعدادات", href: "/profile" },
];

export default function ProfilePage() {
  return (
    <AppShell>
      {/* Profile header */}
      <section className="px-5 pb-2 pt-5">
        <div className="overflow-hidden rounded-3xl bg-forest-gradient p-5 text-cream-50">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-gradient font-arabic text-2xl font-extrabold text-forest-800">
              ن
            </div>
            <div>
              <h1 className="font-arabic text-xl font-bold text-cream-50">
                نورة القحطاني
              </h1>
              <p className="text-sm text-cream-200/80">noura@example.com</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-forest-600/70 px-2 py-0.5 text-[0.65rem] font-bold text-gold-200">
                <ShieldCheck className="h-3 w-3" /> عضوة ذهبية
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "الطلبات", value: "6" },
              { label: "المفضّلة", value: "12" },
              { label: "الإنفاق", value: formatPrice(14200) },
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

      {/* Menu */}
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
              {m.badge && (
                <span className="rounded-full bg-clay-500 px-2 py-0.5 text-[0.65rem] font-bold text-cream-50">
                  {m.badge}
                </span>
              )}
              <ChevronLeft className="h-4 w-4 text-ink-faint" />
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 py-3.5 text-sm font-bold text-clay-500 shadow-card-soft"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Link>
      </section>

      <Footer />
    </AppShell>
  );
}
