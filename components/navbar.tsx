"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";
import { LotusMark } from "./icons/JewelIcons";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "./CartDrawer";
import { BRAND } from "@/data/jewelleryData";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream-100/90 backdrop-blur-md">
        {/* Force the visual LTR arrangement (menu left, actions right) to
            match the reference, while page content stays RTL. */}
        <div dir="ltr" className="flex h-16 items-center justify-between px-4">
          {/* Left: menu + brand */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="القائمة"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            <Link href="/" aria-label={BRAND.name} className="flex items-center gap-1.5">
              <LotusMark className="h-9 w-9 shrink-0" />
              <span className="flex flex-col leading-none">
                <span className="brand-word font-serif text-[1.6rem] font-semibold tracking-wide">
                  {BRAND.name}
                </span>
                <span className="whitespace-nowrap text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-gold-600">
                  {BRAND.tagline}
                </span>
              </span>
            </Link>
          </div>

          {/* Right: actions */}
          <nav className="flex items-center gap-1.5" aria-label="إجراءات سريعة">
            <Link
              href="/search"
              aria-label="بحث"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200"
            >
              <Search className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="المفضّلة"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200"
            >
              <Heart className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
              {wishCount > 0 && (
                <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[0.6rem] font-bold text-cream-50">
                  {wishCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="حقيبة التسوّق"
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-forest-600 text-cream-50 shadow-card-soft transition active:scale-95 hover:bg-forest-700"
            >
              <ShoppingBag className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} />
              {count > 0 && (
                <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-gradient px-1 text-[0.62rem] font-extrabold text-forest-800 shadow">
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
