# Ariana — Gems & Jewellery (أريانا)

A luxury **Arabic (RTL)** jewellery storefront built to be pixel-faithful to
the reference design: warm cream, gold and deep-forest-green palette, elegant
Arabic typography, mobile-first with a sticky bottom navigation, and a full
admin dashboard.

Built with **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma · PostgreSQL**.

---

## ✨ Features

- **Full-stack on PostgreSQL + Prisma**: Next.js Route Handlers back a
  Prisma-powered data layer (`lib/db.ts`) — products CRUD, cart pricing,
  orders with line items, auth (hashed passwords + sessions), newsletter,
  contact, analytics. All data persists in Postgres.
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

> All endpoints read/write PostgreSQL via Prisma (`lib/db.ts`). Data is
> durable across restarts; run `npm run db:seed` to (re)load demo content.

## 🚀 Getting started

```bash
npm install                       # installs deps + generates Prisma client
cp .env.example .env              # set DATABASE_URL for your Postgres
npm run db:migrate                # create tables (prisma migrate dev)
npm run db:seed                   # seed products / customers / orders
npm run dev                       # http://localhost:3000
```

Other scripts:

```bash
npm run build      # prisma generate + next build
npm run start      # serve the production build
npm run lint       # eslint
npm run db:deploy  # apply migrations in production (prisma migrate deploy)
npm run db:studio  # open Prisma Studio
npm run gen:images # regenerate the SVG product art
```

### 🗄️ Database (PostgreSQL + Prisma)

The schema lives in `prisma/schema.prisma` (Product, OrderItem, Order,
Customer, User, Session, Newsletter, ContactMessage). Point `DATABASE_URL`
at any Postgres instance:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

`lib/prisma.ts` exposes a singleton client; `lib/db.ts` is the async
data-access layer every API route and server component calls. Prices are
computed server-side from the DB, and orders store relational line items.

## 🗂️ Structure

```
app/            # App Router pages (storefront + /admin) + /api routes
components/     # Reusable UI (+ admin/, shop/, cart/, etc.)
context/        # Cart, Wishlist, Auth React providers
prisma/         # schema.prisma, migrations, seed.ts
data/           # jewelleryData.ts — central Arabic content source
lib/            # db (Prisma), prisma client, products, analytics, currency
hooks/          # useScrollAnimation
styles/         # luxury.css + animations.css
types/          # shared domain types
public/images/  # 21 generated SVG product illustrations
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
