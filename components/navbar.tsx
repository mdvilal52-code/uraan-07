"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, Heart, ShoppingBag, User } from "lucide-react";
import { LotusMark } from "./icons/JewelIcons";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "./CartDrawer";
import { BRAND, primaryNavLinks } from "@/data/jewelleryData";
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
        <div className="flex h-16 items-center justify-between px-4 lg:h-20 lg:gap-6 lg:px-10">
          {/* Left: menu (mobile) + brand + desktop nav links */}
          <div className="flex items-center gap-2 lg:gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200 lg:hidden"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            <Link href="/" aria-label={BRAND.name} className="flex shrink-0 items-center gap-1.5">
              <LotusMark className="h-9 w-9 shrink-0 lg:h-10 lg:w-10" />
              <span className="flex flex-col leading-none">
                <span className="brand-word font-serif text-[1.6rem] font-semibold tracking-wide lg:text-[1.85rem]">
                  {BRAND.name}
                </span>
                <span className="whitespace-nowrap text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-gold-600">
                  {BRAND.tagline}
                </span>
              </span>
            </Link>

            <nav
              className="hidden items-center gap-5 whitespace-nowrap lg:flex xl:gap-7"
              aria-label="Primary"
            >
              {primaryNavLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm font-bold text-ink-soft transition hover:text-clay-500"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: desktop search entry point — opens the full /search
              experience (which already autofocuses its own live-search
              input) rather than duplicating its debounced-fetch logic here. */}
          <Link
            href="/search"
            aria-label="Search"
            className="hidden max-w-sm flex-1 items-center gap-2 whitespace-nowrap rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-ink-faint transition hover:border-gold-400 xl:flex"
          >
            <Search className="h-4 w-4 shrink-0" />
            Search jewellery &amp; gemstones…
          </Link>

          {/* Right: actions */}
          <nav className="flex items-center gap-1.5 lg:gap-2" aria-label="Quick actions">
            <Link
              href="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200 xl:hidden"
            >
              <Search className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200"
            >
              <Heart className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
              {wishCount > 0 && (
                <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[0.6rem] font-bold text-cream-50">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              aria-label="Account"
              className="hidden h-10 w-10 place-items-center rounded-xl text-ink transition active:scale-95 hover:bg-cream-200 lg:grid"
            >
              <User className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Shopping cart"
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
