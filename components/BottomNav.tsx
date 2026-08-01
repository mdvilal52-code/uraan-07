"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Flower, Store, User } from "lucide-react";

const items = [
  { label: "الرئيسية", href: "/", icon: Home },
  { label: "استكشف", href: "/explore", icon: Compass },
  { label: "المجموعات", href: "/collections", icon: Flower },
  { label: "المتجر", href: "/shop", icon: Store },
  { label: "حسابي", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقّل السفلي"
      className="sticky bottom-0 z-30 border-t border-cream-300/70 bg-cream-50/95 backdrop-blur-md shadow-nav"
    >
      <ul className="flex items-stretch justify-between px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    active
                      ? "bg-forest-600 text-cream-50 nav-active-dot"
                      : "text-ink-muted group-hover:text-forest-500"
                  }`}
                >
                  <Icon
                    className="h-[1.15rem] w-[1.15rem]"
                    strokeWidth={active ? 2.4 : 2}
                    fill={active ? "currentColor" : "none"}
                    fillOpacity={active ? 0.14 : 0}
                  />
                </span>
                <span
                  className={`text-[0.68rem] font-bold transition ${
                    active ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
