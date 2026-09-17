"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { LotusMark } from "./icons/JewelIcons";
import { BRAND, categories } from "@/data/jewelleryData";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Collections", href: "/collections" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const accountLinks = [
  { label: "Profile", href: "/profile" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "Login", href: "/login" },
];

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel (slides in from the start/left) */}
      <aside
        className={`absolute inset-y-0 start-0 flex w-[84%] max-w-[340px] flex-col bg-cream-100 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <LotusMark className="h-8 w-8" />
            <span className="brand-word font-serif text-xl font-semibold">
              {BRAND.name}
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-xl text-ink transition hover:bg-cream-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <nav className="flex flex-col">
            {primaryLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="flex items-center justify-between border-b border-cream-200 py-3.5 text-[1.05rem] font-bold text-ink transition hover:text-clay-500"
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-ink-faint" />
              </Link>
            ))}
          </nav>

          <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-widest text-gold-600">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                onClick={onClose}
                className="chip chip-idle text-[0.82rem]"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-widest text-gold-600">
            Account
          </p>
          <nav className="flex flex-col">
            {accountLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className="py-2.5 text-[0.95rem] font-semibold text-ink-soft transition hover:text-clay-500"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-cream-300 px-5 py-4 text-center">
          <p className="font-sans text-sm text-ink-muted">
            Shine forever, brilliance without end
          </p>
        </div>
      </aside>
    </div>
  );
}
