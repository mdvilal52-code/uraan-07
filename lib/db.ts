import { scryptSync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma, ensureSchema, isBuildPhase, databaseReachable } from "@/lib/prisma";
import { products as catalogProducts } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";
import { generateSecret, generateTotpUri, verifyTotp } from "@/lib/totp";
import type {
  CartLine,
  CategorySlug,
  Coupon,
  Customer,
  GemSurface,
  Order,
  Product,
} from "@/types";

/* ============================================================
   Data-access layer backed by PostgreSQL via Prisma.
   All functions are async. Callers (API routes + server
   components) await them.
   ============================================================ */

type PrismaProduct = Awaited<ReturnType<typeof prisma.product.findFirst>>;
type PrismaOrder = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  date: string;
  items: number;
  couponCode?: string | null;
  discount?: number;
  userId?: string | null;
};

type PrismaCoupon = Awaited<ReturnType<typeof prisma.coupon.findFirst>>;

/** Map a Prisma row to the domain Product shape. */
function toProduct(p: NonNullable<PrismaProduct>): Product {
  return {
    id: p.id,
    name: p.name,
    latin: p.latin,
    category: p.category as CategorySlug,
    price: p.price,
    compareAt: p.compareAt ?? undefined,
    description: p.description,
    surface: p.surface as GemSurface,
    image: p.image,
    tags: p.tags,
    bestSeller: p.bestSeller,
    newArrival: p.newArrival,
    rating: p.rating,
    reviews: p.reviews,
    karats: p.karats ?? [],
    goldWeight: p.goldWeight ?? undefined,
    totalWeight: p.totalWeight ?? undefined,
  };
}

function toOrder(o: PrismaOrder): Order {
  return {
    id: o.id,
    customer: o.customer,
    email: o.email,
    total: o.total,
    status: o.status as Order["status"],
    date: o.date,
    items: o.items,
    couponCode: o.couponCode ?? undefined,
    discount: o.discount ?? 0,
    userId: o.userId ?? undefined,
  };
}

function toCoupon(c: NonNullable<PrismaCoupon>): Coupon {
  return {
    code: c.code,
    description: c.description,
    discountType: c.discountType as Coupon["discountType"],
    value: c.value,
    minSubtotal: c.minSubtotal,
    maxUses: c.maxUses ?? undefined,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : undefined,
  };
}

/* ============================================================
   Self-healing product catalog.
   ------------------------------------------------------------
   If the Product table exists but is empty (a fresh/partially
   migrated DB), auto-seed it from the built-in catalog on first
   read so the storefront is never empty. Memoized per cold start —
   subsequent calls are a no-op once the table has rows.
   ============================================================ */
let productsSeededCheck: Promise<void> | null = null;

function ensureProductsSeeded(): Promise<void> {
  if (!productsSeededCheck) {
    productsSeededCheck = (async () => {
      try {
        // Create-if-missing for every built-in catalogue product (idempotent,
        // once per cold start). `update: {}` means existing rows — including
        // any admin edits — are never overwritten; this only fills in products
        // that aren't in the DB yet (e.g. a newly added category like Gems),
        // so the storefront always carries the full built-in catalogue.
        for (const p of catalogProducts) {
          await prisma.product.upsert({
            where: { id: p.id },
            update: {},
            create: {
              id: p.id,
              name: p.name,
              latin: p.latin,
              category: p.category,
              price: p.price,
              compareAt: p.compareAt ?? null,
              description: p.description,
              surface: p.surface,
              image: p.image,
              tags: p.tags ?? [],
              bestSeller: Boolean(p.bestSeller),
              newArrival: Boolean(p.newArrival),
              rating: p.rating ?? 5,
              reviews: p.reviews ?? 0,
              karats: p.karats ?? [],
              goldWeight: p.goldWeight ?? null,
              totalWeight: p.totalWeight ?? null,
            },
          });

          // One-time backfill of the canonical gold specs for built-in products
          // that predate these columns (their rows were seeded before the
          // weight/karat feature existed, so they'd otherwise show N/A). Guarded
          // on `goldWeight: null` so it never overwrites a value an admin has
          // since entered — admin control stays authoritative.
          if (p.goldWeight != null || p.totalWeight != null || (p.karats?.length ?? 0) > 0) {
            await prisma.product.updateMany({
              where: { id: p.id, goldWeight: null },
              data: {
                karats: p.karats ?? [],
                goldWeight: p.goldWeight ?? null,
                totalWeight: p.totalWeight ?? null,
              },
            });
          }
        }
      } catch (err) {
        console.error("[db] ensureProductsSeeded failed:", err);
        productsSeededCheck = null;
      }
    })();
  }
  return productsSeededCheck;
}

function ensureProductsSeededMaybe(): Promise<void> {
  // Skip the seed pass while `next build` renders (the catalog is served
  // directly) and on a cold start where the DB is known-unreachable — its
  // upsert-per-product loop would otherwise stall on each connection attempt.
  if (isBuildPhase() || !databaseReachable()) {
    productsSeededCheck = null; // let a later call retry once the DB is back
    return Promise.resolve();
  }
  return ensureProductsSeeded();
}

/** In-memory filter over the static catalog — last-resort fallback when
 *  the DB itself is unreachable (not just empty). */
function filterCatalog(opts?: ListOpts): Product[] {
  let rows = catalogProducts as Product[];
  if (opts?.category && opts.category !== "all") {
    rows = rows.filter((p) => p.category === opts.category);
  }
  if (opts?.bestSeller) rows = rows.filter((p) => p.bestSeller);
  if (opts?.newArrival) rows = rows.filter((p) => p.newArrival);
  if (opts?.q) {
    const q = opts.q.trim().toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.latin.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return opts?.limit ? rows.slice(0, opts.limit) : rows;
}

/* ---------------- Products ---------------- */

type ListOpts = {
  category?: string;
  q?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  limit?: number;
};

export async function listProducts(opts?: ListOpts): Promise<Product[]> {
  // At build time serve the built-in catalog directly — never open a DB
  // connection, which would stall static generation if the server is down.
  if (isBuildPhase()) return filterCatalog(opts);

  const where: Record<string, unknown> = {};
  if (opts?.category && opts.category !== "all") where.category = opts.category;
  if (opts?.bestSeller) where.bestSeller = true;
  if (opts?.newArrival) where.newArrival = true;
  if (opts?.q) {
    const q = opts.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { latin: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  try {
    await ensureSchema();
    await ensureProductsSeededMaybe();
    const rows = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "asc" },
      ...(opts?.limit ? { take: opts.limit } : {}),
    });
    if (rows.length === 0) return filterCatalog(opts);
    return rows.map(toProduct);
  } catch (err) {
    console.error("[db] listProducts failed:", err);
    return filterCatalog(opts);
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  // Build time: resolve from the static catalog without touching the DB.
  if (isBuildPhase()) {
    return catalogProducts.find((p) => p.id === id) as Product | undefined;
  }
  try {
    await ensureSchema();
    await ensureProductsSeededMaybe();
    const row = await prisma.product.findUnique({ where: { id } });
    if (row) return toProduct(row);
  } catch (err) {
    console.error("[db] getProduct failed:", err);
  }
  return catalogProducts.find((p) => p.id === id) as Product | undefined;
}

/** Accept karats as an array or a comma-separated string; trim + drop blanks. */
function normalizeKarats(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((k) => String(k).trim()).filter(Boolean);
  if (typeof v === "string")
    return v.split(",").map((k) => k.trim()).filter(Boolean);
  return [];
}

/** A positive finite weight in grams, otherwise null (→ shown as N/A). */
function weightOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Admin form has no client-side cap of its own — reject (rather than
 *  silently truncate) product text fields beyond a sane length. */
const PRODUCT_FIELD_LIMITS = {
  name: 200,
  latin: 200,
  description: 2000,
  image: 500,
  category: 50,
} as const;

function validateProductFields(input: Partial<Product>): string | null {
  for (const field of Object.keys(PRODUCT_FIELD_LIMITS) as Array<
    keyof typeof PRODUCT_FIELD_LIMITS
  >) {
    const value = input[field];
    const max = PRODUCT_FIELD_LIMITS[field];
    if (typeof value === "string" && value.length > max) {
      return `${field} must be ${max} characters or fewer`;
    }
  }
  return null;
}

export async function createProduct(
  input: Partial<Product>,
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  const validationError = validateProductFields(input);
  if (validationError) return { ok: false, error: validationError };

  await ensureSchema();
  const row = await prisma.product.create({
    data: {
      id: input.id?.trim() || `prd-${randomUUID().slice(0, 8)}`,
      name: input.name ?? "New Product",
      latin: input.latin ?? "New Product",
      category: (input.category as string) ?? "necklaces",
      price: Number(input.price) || 0,
      compareAt: input.compareAt ? Number(input.compareAt) : null,
      description: input.description ?? "",
      surface: (input.surface as string) ?? "gold",
      image: input.image ?? "/images/necklace.svg",
      tags: input.tags ?? [],
      bestSeller: Boolean(input.bestSeller),
      newArrival: Boolean(input.newArrival),
      rating: input.rating ?? 5,
      reviews: input.reviews ?? 0,
      karats: normalizeKarats(input.karats),
      goldWeight: weightOrNull(input.goldWeight),
      totalWeight: weightOrNull(input.totalWeight),
    },
  });
  return { ok: true, product: toProduct(row) };
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<
  | { ok: true; product: Product }
  | { ok: false; error: string; notFound?: boolean }
> {
  const validationError = validateProductFields(patch);
  if (validationError) return { ok: false, error: validationError };

  const data: Record<string, unknown> = {};
  for (const f of [
    "name",
    "latin",
    "category",
    "description",
    "surface",
    "image",
  ] as const) {
    if (patch[f] !== undefined) data[f] = patch[f];
  }
  if (patch.price !== undefined) data.price = Number(patch.price) || 0;
  if (patch.compareAt !== undefined)
    data.compareAt = patch.compareAt ? Number(patch.compareAt) : null;
  if (patch.tags !== undefined) data.tags = patch.tags;
  if (patch.bestSeller !== undefined) data.bestSeller = Boolean(patch.bestSeller);
  if (patch.newArrival !== undefined) data.newArrival = Boolean(patch.newArrival);
  if (patch.rating !== undefined) data.rating = patch.rating;
  if (patch.reviews !== undefined) data.reviews = patch.reviews;
  if (patch.karats !== undefined) data.karats = normalizeKarats(patch.karats);
  if (patch.goldWeight !== undefined)
    data.goldWeight = weightOrNull(patch.goldWeight);
  if (patch.totalWeight !== undefined)
    data.totalWeight = weightOrNull(patch.totalWeight);

  try {
    await ensureSchema();
    const row = await prisma.product.update({ where: { id }, data });
    return { ok: true, product: toProduct(row) };
  } catch {
    return { ok: false, error: "Not found", notFound: true };
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await ensureSchema();
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/* ---------------- Cart pricing ---------------- */

export interface PricedLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export async function priceCart(lines: CartLine[]): Promise<{
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
}> {
  const ids = lines.map((l) => l.productId);
  const byId = new Map<string, Product>();
  try {
    await ensureSchema();
    await ensureProductsSeededMaybe();
    if (ids.length) {
      const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
      rows.forEach((r) => byId.set(r.id, toProduct(r)));
    }
  } catch (err) {
    console.error("[db] priceCart DB lookup failed:", err);
  }
  for (const l of lines) {
    if (!byId.has(l.productId)) {
      const fallback = catalogProducts.find((p) => p.id === l.productId);
      if (fallback) byId.set(l.productId, fallback as Product);
    }
  }

  const priced: PricedLine[] = [];
  for (const l of lines) {
    const product = byId.get(l.productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.floor(l.quantity));
    priced.push({
      product,
      quantity,
      lineTotal: product.price * quantity,
    });
  }
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const count = priced.reduce((s, l) => s + l.quantity, 0);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  return { lines: priced, subtotal, shipping, total: subtotal + shipping, count };
}

/* ---------------- Coupons ---------------- */

export interface CouponCheck {
  ok: boolean;
  code?: string;
  description?: string;
  /** AUD amount to subtract from the subtotal. */
  discount?: number;
  error?: string;
}

/** Validate a coupon code against the current subtotal (server-side source of truth). */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponCheck> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a discount code" };

  let row;
  try {
    await ensureSchema();
    row = await prisma.coupon.findUnique({ where: { code } });
  } catch (err) {
    console.error("[db] validateCoupon lookup failed:", err);
    return { ok: false, error: "Unable to verify the code right now — please try again." };
  }

  if (!row || !row.active) {
    return { ok: false, error: "Invalid discount code" };
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "This discount code has expired" };
  }
  if (row.maxUses != null && row.usedCount >= row.maxUses) {
    return { ok: false, error: "This code has reached its usage limit" };
  }
  if (subtotal < row.minSubtotal) {
    return {
      ok: false,
      error: `This code requires a minimum order of ${formatPrice(row.minSubtotal)}`,
    };
  }

  const discount =
    row.discountType === "fixed"
      ? Math.min(row.value, subtotal)
      : Math.round(subtotal * (row.value / 100));

  return { ok: true, code: row.code, description: row.description, discount };
}

/** Thrown inside the createOrder transaction when a coupon's last use was
 *  claimed by a concurrent order between validation and redemption. */
class CouponUnavailableError extends Error {}

export async function listCoupons(): Promise<Coupon[]> {
  try {
    await ensureSchema();
    const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toCoupon);
  } catch (err) {
    console.error("[db] listCoupons failed:", err);
    return [];
  }
}

export async function createCoupon(input: {
  code: string;
  description: string;
  discountType?: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
}): Promise<{ ok: true; coupon: Coupon } | { ok: false; error: string }> {
  const code = (input.code ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Coupon code is required" };
  if (!input.description?.trim()) return { ok: false, error: "Description is required" };
  const value = Number(input.value);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: "Invalid discount value" };
  }
  const discountType = input.discountType === "fixed" ? "fixed" : "percent";
  if (discountType === "percent" && value > 100) {
    return { ok: false, error: "Discount percentage must not exceed 100%" };
  }

  await ensureSchema();
  try {
    const row = await prisma.coupon.create({
      data: {
        code,
        description: input.description.trim(),
        discountType,
        value: Math.round(value),
        minSubtotal: Math.max(0, Math.round(Number(input.minSubtotal) || 0)),
        maxUses:
          input.maxUses == null || Number(input.maxUses) <= 0
            ? null
            : Math.round(Number(input.maxUses)),
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
    return { ok: true, coupon: toCoupon(row) };
  } catch (err) {
    console.error("[db] createCoupon failed:", err);
    return { ok: false, error: "This code is already in use" };
  }
}

export async function deleteCoupon(code: string): Promise<boolean> {
  try {
    await ensureSchema();
    await prisma.coupon.delete({ where: { code: code.trim().toUpperCase() } });
    return true;
  } catch (err) {
    console.error("[db] deleteCoupon failed:", err);
    return false;
  }
}

/* ---------------- Orders ---------------- */

const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status" };
  }
  try {
    await ensureSchema();
    const row = await prisma.order.update({ where: { id }, data: { status } });
    return { ok: true, order: toOrder(row) };
  } catch (err) {
    console.error("[db] updateOrderStatus failed:", err);
    return { ok: false, error: "Order not found" };
  }
}

export async function listOrders(
  opts?: number | { limit?: number; userId?: string },
): Promise<Order[]> {
  // Accept a bare number for back-compat with existing `listOrders(limit)` callers.
  const { limit, userId } =
    typeof opts === "number" ? { limit: opts, userId: undefined } : (opts ?? {});
  try {
    await ensureSchema();
    const rows = await prisma.order.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
      ...(limit ? { take: limit } : {}),
    });
    return rows.map(toOrder);
  } catch (err) {
    console.error("[db] listOrders failed:", err);
    return [];
  }
}

export async function createOrder(input: {
  customer: string;
  email: string;
  lines: CartLine[];
  couponCode?: string;
  userId?: string;
}): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  const priced = await priceCart(input.lines);
  if (priced.lines.length === 0) {
    return { ok: false, error: "Your cart is empty" };
  }

  let discount = 0;
  let couponCode: string | undefined;
  if (input.couponCode) {
    const check = await validateCoupon(input.couponCode, priced.subtotal);
    if (!check.ok) {
      return { ok: false, error: check.error ?? "Invalid discount code" };
    }
    discount = check.discount ?? 0;
    couponCode = check.code;
  }

  const total = Math.max(0, priced.subtotal - discount) + priced.shipping;
  const date = new Date().toISOString().slice(0, 10);
  try {
    await ensureSchema();
    const count = await prisma.order.count();
    const id = `AR-${10242 + count}`;

    const row = await prisma.$transaction(async (tx) => {
      // Re-check + redeem the coupon atomically in the same transaction as
      // the order insert. A single UPDATE...WHERE row-locks the coupon for
      // the duration of the statement, so two orders racing for a coupon's
      // last remaining use can't both succeed — unlike the previous
      // validate-then-increment-afterward flow, where a concurrent order
      // could slip through between the read and the write and let the
      // coupon be redeemed past its maxUses cap.
      if (couponCode) {
        const redeemed: number = await tx.$executeRaw`
          UPDATE "Coupon"
          SET "usedCount" = "usedCount" + 1
          WHERE "code" = ${couponCode}
            AND "active" = true
            AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
        `;
        if (redeemed === 0) throw new CouponUnavailableError();
      }

      // Keep the admin Customers table (and its KPI) live: an account-linked
      // order upserts that customer's record instead of only ever reflecting
      // prisma/seed.ts's one-time demo rows. Guest checkouts (no userId)
      // aren't tracked here, matching how order history already treats them.
      if (input.userId) {
        await tx.customer.upsert({
          where: { id: input.userId },
          update: { orders: { increment: 1 }, spent: { increment: total } },
          create: {
            id: input.userId,
            name: input.customer || "Guest",
            email: input.email || "guest@example.com",
            orders: 1,
            spent: total,
            joined: date,
          },
        });
      }

      return tx.order.create({
        data: {
          id,
          customer: input.customer || "Guest",
          email: input.email || "guest@example.com",
          total,
          status: "paid",
          date,
          items: priced.count,
          couponCode: couponCode ?? null,
          discount,
          userId: input.userId ?? null,
          lines: {
            create: priced.lines.map((l) => ({
              productId: l.product.id,
              name: l.product.name,
              price: l.product.price,
              quantity: l.quantity,
            })),
          },
        },
      });
    });
    return { ok: true, order: toOrder(row) };
  } catch (err) {
    if (err instanceof CouponUnavailableError) {
      return {
        ok: false,
        error:
          "This discount code just reached its usage limit — remove it and try again.",
      };
    }
    console.error("[db] createOrder DB insert failed, returning offline order:", err);
    return {
      ok: true,
      order: {
        id: `AR-${10242 + Math.floor(Math.random() * 900)}`,
        customer: input.customer || "Guest",
        email: input.email || "guest@example.com",
        total,
        status: "paid",
        date,
        items: priced.count,
        couponCode,
        discount,
      },
    };
  }
}

/* ---------------- Customers ---------------- */

export async function listCustomers(): Promise<Customer[]> {
  try {
    await ensureSchema();
    const rows = await prisma.customer.findMany({ orderBy: { joined: "desc" } });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      orders: c.orders,
      spent: c.spent,
      joined: c.joined,
    }));
  } catch (err) {
    console.error("[db] listCustomers failed:", err);
    return [];
  }
}

/* ---------------- Auth ---------------- */

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "Missing required information" };

  await ensureSchema();

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[db] createUser lookup failed:", err);
    return { ok: false, error: "Unable to connect to the database — please try again later." };
  }
  if (existing) return { ok: false, error: "This email is already registered" };

  const salt = randomBytes(16).toString("hex");
  try {
    const user = await prisma.user.create({
      data: {
        id: `usr-${randomUUID().slice(0, 8)}-${randomUUID().slice(0, 4)}`,
        name: (input.name ?? "").trim() || "Customer",
        email,
        salt,
        hash: hashPassword(input.password, salt),
        role: "customer",
      },
    });
    // Best-effort: give every new account a Customer row (0 orders/spent) so
    // the admin Customers table reflects real signups, not just seed data.
    // Never let this fail the registration itself.
    await prisma.customer
      .upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          orders: 0,
          spent: 0,
          joined: new Date().toISOString().slice(0, 10),
        },
      })
      .catch((err) => console.error("[db] customer sync on register failed:", err));
    return { ok: true, user };
  } catch (err) {
    console.error("[db] createUser insert failed:", err);
    return { ok: false, error: "Unable to create the account right now — please try again." };
  }
}

/**
 * Idempotently ensure the designated admin account exists, driven entirely
 * by environment variables (ADMIN_EMAIL + ADMIN_PASSWORD) — never hardcoded.
 * Run once per cold start before an admin login is verified, so the panel
 * has exactly one legitimate way to gain admin access: the operator-provided
 * credentials. Existing users matching ADMIN_EMAIL are promoted to admin;
 * their password is only (re)set when the row is first created.
 */
let adminSeededCheck: Promise<void> | null = null;

export function ensureAdminSeeded(): Promise<void> {
  if (adminSeededCheck) return adminSeededCheck;
  adminSeededCheck = (async () => {
    const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD ?? "";
    if (!email || !password) return; // No admin configured — nothing to do.
    try {
      await ensureSchema();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        if (existing.role !== "admin") {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: "admin" },
          });
        }
        return;
      }
      const salt = randomBytes(16).toString("hex");
      await prisma.user.create({
        data: {
          id: `usr-${randomUUID().slice(0, 8)}-${randomUUID().slice(0, 4)}`,
          name: process.env.ADMIN_NAME?.trim() || "Administrator",
          email,
          salt,
          hash: hashPassword(password, salt),
          role: "admin",
        },
      });
      console.log("[db] admin account ensured from environment");
    } catch (err) {
      console.error("[db] ensureAdminSeeded failed:", err);
      adminSeededCheck = null; // Allow a retry on the next call.
    }
  })();
  return adminSeededCheck;
}

/** Constant-time password check, shared by login and any other flow that
 *  needs to re-verify the current password (e.g. disabling 2FA). */
function verifyPassword(user: { salt: string; hash: string }, password: string): boolean {
  const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.hash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  await ensureAdminSeeded();
  await ensureSchema();
  const user = await prisma.user.findUnique({
    where: { email: (email ?? "").trim().toLowerCase() },
  });
  if (!user) return null;
  return verifyPassword(user, password) ? user : null;
}

export async function updateUserName(
  userId: string,
  name: string,
): Promise<AuthUser | null> {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return null;
  try {
    await ensureSchema();
    return await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed },
    });
  } catch (err) {
    console.error("[db] updateUserName failed:", err);
    return null;
  }
}

/** Absolute session lifetime (matches the session cookie's max-age). */
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string): Promise<string> {
  await ensureSchema();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function getUserByToken(
  token?: string | null,
): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    await ensureSchema();
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) return null;

    // Enforce absolute expiry. Legacy rows without an explicit expiry fall
    // back to createdAt + max-age, so no session outlives the policy window.
    const expiry =
      session.expiresAt?.getTime() ??
      session.createdAt.getTime() + SESSION_MAX_AGE_MS;
    if (Number.isFinite(expiry) && expiry < Date.now()) {
      // Best-effort cleanup of the expired token; ignore failures.
      prisma.session.deleteMany({ where: { token } }).catch(() => {});
      return null;
    }
    return session.user ?? null;
  } catch (err) {
    console.error("[db] getUserByToken failed:", err);
    return null;
  }
}

export async function destroySession(token?: string | null): Promise<void> {
  if (!token) return;
  try {
    await ensureSchema();
    await prisma.session.deleteMany({ where: { token } });
  } catch (err) {
    console.error("[db] destroySession failed:", err);
  }
}

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "customer" | "admin",
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

/* ---------------- Two-factor auth (TOTP) ---------------- */

/** Backup code shape: 10 hex chars as XXXXX-XXXXX — deliberately never
 *  matches /^\d{6}$/, so a login code can be told apart from a backup code
 *  by shape alone, with no extra flag from the client. */
function generateBackupCode(): string {
  const hex = randomBytes(5).toString("hex").toUpperCase();
  return `${hex.slice(0, 5)}-${hex.slice(5)}`;
}

/** Each stored code is "<saltHex>:<scryptHex>" — its own random salt, not
 *  the user's password salt (hashPassword takes the salt as a parameter). */
function hashBackupCode(code: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(code, salt)}`;
}

function verifyBackupCode(stored: string, candidate: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidateBuf = Buffer.from(hashPassword(candidate, salt), "hex");
  const storedBuf = Buffer.from(hash, "hex");
  if (candidateBuf.length !== storedBuf.length) return false;
  return timingSafeEqual(candidateBuf, storedBuf);
}

/** Begin (or restart) 2FA setup: stores a fresh secret but leaves
 *  twoFactorEnabled false, so a half-finished setup never gates login.
 *  Refuses to run while 2FA is already enabled — disable first to
 *  reconfigure, so a hijacked admin session can't silently swap the
 *  secret out from under the legitimate owner. */
export async function initiateTwoFactorSetup(
  userId: string,
  email: string,
): Promise<{ ok: true; secret: string; uri: string } | { ok: false; error: string }> {
  await ensureSchema();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Account not found" };
  if (user.twoFactorEnabled) {
    return {
      ok: false,
      error: "Two-factor authentication is already enabled — disable it first to reconfigure.",
    };
  }
  const secret = generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
  return { ok: true, secret, uri: generateTotpUri(secret, email, "Ariana Admin") };
}

/** Confirms setup with a live code from the authenticator app, flips
 *  twoFactorEnabled on, and mints one-time backup codes — returned in the
 *  clear exactly once; only their hashes are ever persisted. */
export async function confirmTwoFactorSetup(
  userId: string,
  code: string,
): Promise<{ ok: true; backupCodes: string[] } | { ok: false; error: string }> {
  await ensureSchema();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) {
    return { ok: false, error: "Start setup before confirming a code" };
  }
  const step = verifyTotp(user.twoFactorSecret, code);
  if (step === null) {
    return { ok: false, error: "Incorrect code — please try again" };
  }
  const backupCodes = Array.from({ length: 8 }, () => generateBackupCode());
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorLastStep: step,
      twoFactorBackupCodes: backupCodes.map(hashBackupCode),
    },
  });
  return { ok: true, backupCodes };
}

/** Disabling 2FA re-verifies the current password (step-up auth — a bare
 *  hijacked session cookie isn't enough) and, as defense in depth, revokes
 *  every *other* session for the account so a stale/stolen cookie can't
 *  outlive a deliberate "turn 2FA off" response. Never signs out the
 *  caller's own session. */
export async function disableTwoFactor(
  userId: string,
  password: string,
  currentToken?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureSchema();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Account not found" };
  if (!verifyPassword(user, password)) {
    return { ok: false, error: "Incorrect password" };
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
      twoFactorLastStep: null,
    },
  });
  await prisma.session
    .deleteMany({
      where: { userId, ...(currentToken ? { token: { not: currentToken } } : {}) },
    })
    .catch((err) => console.error("[db] session revoke on 2FA disable failed:", err));
  return { ok: true };
}

const TWOFACTOR_PENDING_MAX_AGE_MS = 1000 * 60 * 5; // 5 minutes

/** Issued once a login's password check succeeds on a 2FA-enabled account.
 *  Proves nothing but "password was correct" — a real Session is only
 *  created once verifyTwoFactorLogin succeeds. Kept in its own table (not
 *  extra Session columns) so this short-lived, low-trust token can never
 *  be confused with or replayed as a real session token. */
export async function createTwoFactorPending(userId: string): Promise<string> {
  await ensureSchema();
  await prisma.twoFactorPending.deleteMany({ where: { userId } });
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TWOFACTOR_PENDING_MAX_AGE_MS);
  await prisma.twoFactorPending.create({ data: { token, userId, expiresAt } });
  return token;
}

/** Completes login for a 2FA-enabled account: accepts either a live TOTP
 *  code or a one-time backup code (told apart by shape), enforces the
 *  replay guard on TOTP, and consumes a backup code on use. Never reveals
 *  which part (expired challenge vs. wrong code) failed. */
export async function verifyTwoFactorLogin(
  pendingToken: string | undefined | null,
  code: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
  if (!pendingToken) return { ok: false, error: "Session expired — please sign in again" };
  await ensureSchema();
  const pending = await prisma.twoFactorPending.findUnique({ where: { token: pendingToken } });
  if (!pending || pending.expiresAt.getTime() < Date.now()) {
    await prisma.twoFactorPending.deleteMany({ where: { token: pendingToken } }).catch(() => {});
    return { ok: false, error: "Session expired — please sign in again" };
  }
  const user = await prisma.user.findUnique({ where: { id: pending.userId } });
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return { ok: false, error: "Two-factor authentication is not enabled for this account" };
  }

  const trimmed = (code ?? "").trim();
  if (/^\d{6}$/.test(trimmed)) {
    const step = verifyTotp(user.twoFactorSecret, trimmed);
    if (step === null || (user.twoFactorLastStep !== null && step <= user.twoFactorLastStep)) {
      return { ok: false, error: "Incorrect code — please try again" };
    }
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorLastStep: step } });
  } else {
    const matchIndex = user.twoFactorBackupCodes.findIndex((stored) =>
      verifyBackupCode(stored, trimmed.toUpperCase()),
    );
    if (matchIndex === -1) {
      return { ok: false, error: "Incorrect code — please try again" };
    }
    const remaining = user.twoFactorBackupCodes.slice();
    remaining.splice(matchIndex, 1);
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: remaining } });
  }

  await prisma.twoFactorPending.deleteMany({ where: { token: pendingToken } }).catch(() => {});
  return { ok: true, user };
}

/* ---------------- Admin: user management ---------------- */

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

export async function listUsers(): Promise<AdminUserRow[]> {
  try {
    await ensureSchema();
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as "customer" | "admin",
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("[db] listUsers failed:", err);
    return [];
  }
}

/** Guard shared by role changes and deletes: never let an admin action strip
 *  the panel of its last admin, or act on the acting admin's own account
 *  (self-demotion/self-deletion must go through another admin). */
async function guardAdminMutation(
  actingAdminId: string,
  targetId: string,
  demoting: boolean,
): Promise<string | null> {
  if (targetId === actingAdminId) {
    return demoting
      ? "You can't change your own role here"
      : "You can't delete your own account here";
  }
  if (demoting) {
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (target?.role === "admin") {
      const admins = await prisma.user.count({ where: { role: "admin" } });
      if (admins <= 1) return "Can't remove the last remaining admin";
    }
  }
  return null;
}

export async function setUserRole(
  actingAdminId: string,
  targetId: string,
  role: "customer" | "admin",
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await ensureSchema();
    const blocked = await guardAdminMutation(actingAdminId, targetId, role !== "admin");
    if (blocked) return { ok: false, error: blocked };
    await prisma.user.update({ where: { id: targetId }, data: { role } });
    return { ok: true };
  } catch (err) {
    console.error("[db] setUserRole failed:", err);
    return { ok: false, error: "Unable to update this user right now" };
  }
}

export async function deleteUserAccount(
  actingAdminId: string,
  targetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await ensureSchema();
    const blocked = await guardAdminMutation(actingAdminId, targetId, true);
    if (blocked) return { ok: false, error: blocked };
    await prisma.user.delete({ where: { id: targetId } });
    return { ok: true };
  } catch (err) {
    console.error("[db] deleteUserAccount failed:", err);
    return { ok: false, error: "Unable to delete this user right now" };
  }
}

/* ---------------- Misc capture ---------------- */

export async function addNewsletter(email: string): Promise<boolean> {
  const e = (email ?? "").trim().toLowerCase();
  if (!e) return false;
  await ensureSchema();
  await prisma.newsletter.upsert({
    where: { email: e },
    update: {},
    create: { email: e },
  });
  return true;
}

export async function addContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ id: string }> {
  await ensureSchema();
  const msg = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
    },
  });
  return { id: msg.id };
}

/* ---------------- Analytics ---------------- */

export async function analytics(): Promise<{
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  averageOrderValue: number;
}> {
  try {
    await ensureSchema();
    const [revenueAgg, validCount, orders, customers, products] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: "cancelled" } },
        }),
        prisma.order.count({ where: { status: { not: "cancelled" } } }),
        prisma.order.count(),
        prisma.customer.count(),
        prisma.product.count(),
      ]);
    const revenue = revenueAgg._sum.total ?? 0;
    return {
      revenue,
      orders,
      customers,
      products,
      averageOrderValue: validCount ? Math.round(revenue / validCount) : 0,
    };
  } catch (err) {
    console.error("[db] analytics failed:", err);
    return { revenue: 0, orders: 0, customers: 0, products: 0, averageOrderValue: 0 };
  }
}

/** Real monthly revenue for the last `months` months — replaces what used to
 *  be a hardcoded series unrelated to the actual database. */
export async function monthlyRevenue(
  months = 7,
): Promise<{ month: string; value: number }[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const buckets: { key: string; month: string; value: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: labels[d.getMonth()]!, value: 0 });
  }
  try {
    await ensureSchema();
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start }, status: { not: "cancelled" } },
      select: { createdAt: true, total: true },
    });
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const o of orders) {
      const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.value += o.total;
    }
  } catch (err) {
    console.error("[db] monthlyRevenue failed:", err);
  }
  return buckets.map(({ month, value }) => ({ month, value }));
}

function pctTrend(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "New" : "—";
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** analytics() plus real month-over-month trend deltas — replaces the
 *  hardcoded "+12.4%"-style figures the dashboard used to show regardless
 *  of actual activity. */
export async function analyticsWithTrends(): Promise<{
  revenue: number;
  revenueTrend: string;
  orders: number;
  ordersTrend: string;
  customers: number;
  customersTrend: string;
  products: number;
  productsTrend: string;
  averageOrderValue: number;
  newCustomersThisMonth: number;
  returningCustomerRate: number;
}> {
  const base = await analytics();
  const now = new Date();
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  try {
    await ensureSchema();
    const [
      revThis, revLast, ordThis, ordLast,
      custThis, custLast, prodThis,
      totalCustomers, returningCustomers,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startThis } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" }, createdAt: { gte: startLast, lt: startThis } } }),
      prisma.order.count({ where: { createdAt: { gte: startThis } } }),
      prisma.order.count({ where: { createdAt: { gte: startLast, lt: startThis } } }),
      prisma.user.count({ where: { createdAt: { gte: startThis }, role: "customer" } }),
      prisma.user.count({ where: { createdAt: { gte: startLast, lt: startThis }, role: "customer" } }),
      prisma.product.count({ where: { createdAt: { gte: startThis } } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { orders: { gt: 1 } } }),
    ]);
    return {
      ...base,
      revenueTrend: pctTrend(revThis._sum.total ?? 0, revLast._sum.total ?? 0),
      ordersTrend: pctTrend(ordThis, ordLast),
      customersTrend: pctTrend(custThis, custLast),
      productsTrend: prodThis > 0 ? `+${prodThis} new` : "—",
      newCustomersThisMonth: custThis,
      returningCustomerRate: totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0,
    };
  } catch (err) {
    console.error("[db] analyticsWithTrends failed:", err);
    return {
      ...base,
      revenueTrend: "—",
      ordersTrend: "—",
      customersTrend: "—",
      productsTrend: "—",
      newCustomersThisMonth: 0,
      returningCustomerRate: 0,
    };
  }
}

/* ---------------- Admin: banners ---------------- */

export interface BannerRow {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  image?: string;
  surface: string;
  status: string;
  createdAt: string;
}

function toBanner(b: {
  id: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  link: string | null;
  image: string | null;
  surface: string;
  status: string;
  createdAt: Date;
}): BannerRow {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? undefined,
    buttonText: b.buttonText ?? undefined,
    link: b.link ?? undefined,
    image: b.image ?? undefined,
    surface: b.surface,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function listBanners(): Promise<BannerRow[]> {
  try {
    await ensureSchema();
    const rows = await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toBanner);
  } catch (err) {
    console.error("[db] listBanners failed:", err);
    return [];
  }
}

export async function createBanner(input: {
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  image?: string;
  surface?: string;
  status?: string;
}): Promise<{ ok: true; banner: BannerRow } | { ok: false; error: string }> {
  const title = (input.title ?? "").trim();
  if (!title) return { ok: false, error: "Title is required" };
  try {
    await ensureSchema();
    const row = await prisma.banner.create({
      data: {
        title,
        subtitle: input.subtitle?.trim() || null,
        buttonText: input.buttonText?.trim() || null,
        link: input.link?.trim() || null,
        image: input.image?.trim() || null,
        surface: input.surface || "gold",
        status: input.status || "active",
      },
    });
    return { ok: true, banner: toBanner(row) };
  } catch (err) {
    console.error("[db] createBanner failed:", err);
    return { ok: false, error: "Unable to create the banner" };
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  try {
    await ensureSchema();
    await prisma.banner.delete({ where: { id } });
    return true;
  } catch (err) {
    console.error("[db] deleteBanner failed:", err);
    return false;
  }
}

/* ---------------- Admin: store settings ---------------- */

export interface StoreSettingsRow {
  storeName: string;
  email: string;
  phone: string;
  currency: string;
  freeShippingThreshold: number;
  taxRatePercent: number;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
}

const DEFAULT_SETTINGS: StoreSettingsRow = {
  storeName: "Ariana Gems & Jewellery",
  email: "hello@ariana.example",
  phone: "+61 3 9791 1331",
  currency: "AUD",
  freeShippingThreshold: 500,
  taxRatePercent: 5,
  notifyNewOrders: true,
  notifyLowStock: true,
};

export async function getSettings(): Promise<StoreSettingsRow> {
  try {
    await ensureSchema();
    const row = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });
    return {
      storeName: row.storeName,
      email: row.email,
      phone: row.phone,
      currency: row.currency,
      freeShippingThreshold: row.freeShippingThreshold,
      taxRatePercent: row.taxRatePercent,
      notifyNewOrders: row.notifyNewOrders,
      notifyLowStock: row.notifyLowStock,
    };
  } catch (err) {
    console.error("[db] getSettings failed:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  input: Partial<StoreSettingsRow>,
): Promise<{ ok: true; settings: StoreSettingsRow } | { ok: false; error: string }> {
  try {
    await ensureSchema();
    const data: Record<string, unknown> = {};
    if (input.storeName !== undefined) data.storeName = input.storeName.trim() || DEFAULT_SETTINGS.storeName;
    if (input.email !== undefined) data.email = input.email.trim();
    if (input.phone !== undefined) data.phone = input.phone.trim();
    if (input.currency !== undefined) data.currency = input.currency.trim() || DEFAULT_SETTINGS.currency;
    if (input.freeShippingThreshold !== undefined) {
      const n = Number(input.freeShippingThreshold);
      data.freeShippingThreshold = Number.isFinite(n) && n >= 0 ? Math.round(n) : DEFAULT_SETTINGS.freeShippingThreshold;
    }
    if (input.taxRatePercent !== undefined) {
      const n = Number(input.taxRatePercent);
      data.taxRatePercent = Number.isFinite(n) && n >= 0 ? n : DEFAULT_SETTINGS.taxRatePercent;
    }
    if (input.notifyNewOrders !== undefined) data.notifyNewOrders = Boolean(input.notifyNewOrders);
    if (input.notifyLowStock !== undefined) data.notifyLowStock = Boolean(input.notifyLowStock);

    const row = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    return {
      ok: true,
      settings: {
        storeName: row.storeName,
        email: row.email,
        phone: row.phone,
        currency: row.currency,
        freeShippingThreshold: row.freeShippingThreshold,
        taxRatePercent: row.taxRatePercent,
        notifyNewOrders: row.notifyNewOrders,
        notifyLowStock: row.notifyLowStock,
      },
    };
  } catch (err) {
    console.error("[db] updateSettings failed:", err);
    return { ok: false, error: "Unable to save settings right now" };
  }
}
