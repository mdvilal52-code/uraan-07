"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  FolderTree,
  ImageIcon,
  Star,
  Ticket,
  UserCog,
  Settings,
  Store,
} from "lucide-react";
import { LotusMark } from "@/components/icons/JewelIcons";
import { BRAND } from "@/data/jewelleryData";

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/admin/categories", label: "الفئات", icon: FolderTree },
  { href: "/admin/banners", label: "البانرات", icon: ImageIcon },
  { href: "/admin/reviews", label: "التقييمات", icon: Star },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/users", label: "المستخدمون", icon: UserCog },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({ variant = "desktop" }: { variant?: "desktop" | "drawer" }) {
  const pathname = usePathname();
  const base =
    variant === "drawer"
      ? "flex h-full w-64 shrink-0 flex-col bg-forest-700 text-cream-100"
      : "hidden w-64 shrink-0 flex-col border-e border-forest-600/30 bg-forest-700 text-cream-100 md:flex";

  return (
    <aside className={base}>
      <div className="flex items-center gap-2 border-b border-forest-600/40 px-5 py-5">
        <LotusMark className="h-9 w-9" />
        <div className="flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold text-cream-50">
            {BRAND.name}
          </span>
          <span className="text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-gold-200">
            لوحة الإدارة
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((l) => {
          const active = l.exact
            ? pathname === l.href
            : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-gold-gradient text-forest-800"
                  : "text-cream-200/80 hover:bg-forest-600/50 hover:text-cream-50"
              }`}
            >
              <l.icon className="h-[1.15rem] w-[1.15rem]" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-forest-600/40 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream-200/80 transition hover:bg-forest-600/50 hover:text-cream-50"
        >
          <Store className="h-[1.15rem] w-[1.15rem]" />
          العودة للمتجر
        </Link>
      </div>
    </aside>
  );
}
