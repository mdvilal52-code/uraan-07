# Ariana — Gems & Jewellery (أريانا)

A luxury **Arabic (RTL)** jewellery storefront built to be pixel-faithful to
the reference design: warm cream, gold and deep-forest-green palette, elegant
Arabic typography, mobile-first with a sticky bottom navigation, and a full
admin dashboard.

Built with **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS**.

---

## ✨ Features

- **Full-stack**: Next.js Route Handlers back a runtime data store
  (`lib/db.ts`) — products CRUD, cart pricing, orders, auth (sessions),
  newsletter, contact, analytics. Swap the store internals for a real
  database without touching callers.
- **Working commerce flow**: add to cart → server-priced cart → checkout →
  order created in the backend → confirmation. Cart & wishlist persist in
  `localStorage`; totals come from the API (products are the price source
  of truth).
- **Auth**: register / login / logout with hashed passwords (`scrypt`) and
  http-only session cookies; the profile reflects the signed-in user.
- **Real image art**: 21 self-authored SVG jewellery illustrations
  (`npm run gen:images`) rendered via `next/image`.
- **Mobile-first**, centered phone-width canvas that scales cleanly to tablet
  and desktop without changing the design.
- **Full RTL** support (`dir="rtl"`, logical `ms-/me-/ps-/pe-` utilities).
- **Professional Gulf Arabic** copy throughout (no machine translation).
- Prices in **AUD** (`AUD 2,450`) via a single `lib/currency.ts` helper.
- **Storefront**: Home, Explore, Collections, Shop (with live category
  filter), Product detail, Cart, Wishlist, Checkout, Search, Auth, Profile,
  About, Contact.
- **Admin dashboard**: analytics, products (live list / add / edit / delete),
  orders, customers, categories, banners, reviews, coupons, users, settings.
- **SEO** metadata, Open Graph, Arabic locale, semantic HTML, ARIA labels.
- **Performance**: `next/font` (Tajawal + Cormorant + Amiri), scroll-reveal
  animations with `prefers-reduced-motion` support, no layout shift.

## 🔌 API

| Method | Route | Purpose |
| ------ | ----- | ------- |
| GET/POST | `/api/products` | list (filters: `category`, `q`, `bestSeller`, `newArrival`, `limit`) / create |
| GET/PUT/DELETE | `/api/products/[id]` | read / update / delete |
| POST | `/api/cart` | price a cart server-side |
| GET/POST | `/api/orders` | list / place an order |
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | auth |
| GET | `/api/auth/me` | current session user |
| POST | `/api/newsletter` · `/api/contact` | capture |
| GET | `/api/analytics` | dashboard metrics |

> The store is an in-memory singleton seeded from `data/` + `lib/`, shared
> across requests in a running server. It resets on restart — replace
> `lib/db.ts` with a database for durable persistence.

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
