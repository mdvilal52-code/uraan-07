# Ariana — Gems & Jewellery (أريانا)

A luxury **Arabic (RTL)** jewellery storefront built to be pixel-faithful to
the reference design: warm cream, gold and deep-forest-green palette, elegant
Arabic typography, mobile-first with a sticky bottom navigation, and a full
admin dashboard.

Built with **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS**.

---

## ✨ Features

- **Mobile-first**, centered phone-width canvas that scales cleanly to tablet
  and desktop without changing the design.
- **Full RTL** support (`dir="rtl"`, logical `ms-/me-/ps-/pe-` utilities).
- **Professional Gulf Arabic** copy throughout (no machine translation).
- Prices in **AUD** (`AUD 2,450`) via a single `lib/currency.ts` helper.
- **Storefront**: Home, Explore, Collections, Shop (with category filter),
  Product detail, Cart, Wishlist, Checkout, Search, Auth, Profile, About,
  Contact.
- **Admin dashboard**: analytics, products (list/add/edit), orders, customers,
  categories, banners, reviews, coupons, users, settings.
- **SEO** metadata, Open Graph, Arabic locale, semantic HTML, ARIA labels.
- **Performance**: `next/font` (Tajawal + Cormorant + Amiri), scroll-reveal
  animations with `prefers-reduced-motion` support, no layout shift.
- **Elegant placeholder imagery** so the layout is complete before real
  photography — drop HD photos into `public/images/` (see its README).

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## 🗂️ Structure

```
app/            # App Router pages (storefront + /admin)
components/     # Reusable UI (+ admin/, shop/, cart/, etc.)
data/           # jewelleryData.ts — central Arabic content source
lib/            # products, orders, users, analytics, currency helpers
hooks/          # useScrollAnimation
styles/         # luxury.css + animations.css
types/          # shared domain types
public/images/  # drop real HD product photos here
```

## 🎨 Design tokens

Defined in `tailwind.config.ts`:

- **cream** — warm neutral backgrounds
- **gold** — brand accent / logo / prices
- **forest** — deep green for primary buttons & featured cards
- **clay** — terracotta accent (`تسوّق الآن` links)
- **ink** — text scale

## 🖼️ Adding real product photos

See [`public/images/README.md`](public/images/README.md). Swapping the
placeholder for `next/image` requires no layout changes.

## 🔗 Key routes

| Route                    | Screen                              |
| ------------------------ | ----------------------------------- |
| `/`                      | Home                                |
| `/explore`               | Explore (categories, trending, …)   |
| `/collections`           | Curated collections                 |
| `/shop`                  | Store with category filter          |
| `/product/[id]`          | Product detail                      |
| `/cart` · `/checkout`    | Cart & checkout                     |
| `/admin`                 | Admin dashboard                     |
