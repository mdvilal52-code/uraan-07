import { scryptSync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma, ensureSchema, isBuildPhase, databaseReachable } from "@/lib/prisma";
import { products as catalogProducts } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";
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
        console.log(`[db] ensured ${catalogProducts.length} built-in products present`);
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

export async function createProduct(
  input: Partial<Product>,
): Promise<Product> {
  await ensureSchema();
  const row = await prisma.product.create({
    data: {
      id: input.id?.trim() || `prd-${randomUUID().slice(0, 8)}`,
      name: input.name ?? "منتج جديد",
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
  return toProduct(row);
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product | undefined> {
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
    return toProduct(row);
  } catch {
    return undefined;
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
  if (!code) return { ok: false, error: "أدخلي كود الخصم" };

  let row;
  try {
    await ensureSchema();
    row = await prisma.coupon.findUnique({ where: { code } });
  } catch (err) {
    console.error("[db] validateCoupon lookup failed:", err);
    return { ok: false, error: "تعذّر التحقق من الكود حاليًا، حاول لاحقًا." };
  }

  if (!row || !row.active) {
    return { ok: false, error: "كود الخصم غير صالح" };
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "انتهت صلاحية كود الخصم" };
  }
  if (row.maxUses != null && row.usedCount >= row.maxUses) {
    return { ok: false, error: "تم استخدام هذا الكود بالكامل" };
  }
  if (subtotal < row.minSubtotal) {
    return {
      ok: false,
      error: `هذا الكود يتطلب حدًا أدنى للطلب قدره ${formatPrice(row.minSubtotal)}`,
    };
  }

  const discount =
    row.discountType === "fixed"
      ? Math.min(row.value, subtotal)
      : Math.round(subtotal * (row.value / 100));

  return { ok: true, code: row.code, description: row.description, discount };
}

/** Atomically mark one use of a coupon (best-effort; called right after an order is placed). */
async function redeemCoupon(code: string): Promise<void> {
  try {
    await ensureSchema();
    await prisma.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  } catch (err) {
    console.error("[db] redeemCoupon failed:", err);
  }
}

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
  if (!code) return { ok: false, error: "كود الكوبون مطلوب" };
  if (!input.description?.trim()) return { ok: false, error: "الوصف مطلوب" };
  const value = Number(input.value);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, error: "قيمة الخصم غير صالحة" };
  }
  const discountType = input.discountType === "fixed" ? "fixed" : "percent";
  if (discountType === "percent" && value > 100) {
    return { ok: false, error: "نسبة الخصم يجب ألا تتجاوز 100%" };
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
    return { ok: false, error: "هذا الكود مستخدم مسبقًا" };
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
    return { ok: false, error: "السلة فارغة" };
  }

  let discount = 0;
  let couponCode: string | undefined;
  if (input.couponCode) {
    const check = await validateCoupon(input.couponCode, priced.subtotal);
    if (!check.ok) {
      return { ok: false, error: check.error ?? "كود الخصم غير صالح" };
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

    const row = await prisma.order.create({
      data: {
        id,
        customer: input.customer || "زائر",
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
    if (couponCode) await redeemCoupon(couponCode);
    return { ok: true, order: toOrder(row) };
  } catch (err) {
    console.error("[db] createOrder DB insert failed, returning offline order:", err);
    return {
      ok: true,
      order: {
        id: `AR-${10242 + Math.floor(Math.random() * 900)}`,
        customer: input.customer || "زائر",
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
  if (!email || !input.password) return { ok: false, error: "بيانات ناقصة" };

  await ensureSchema();

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    console.error("[db] createUser lookup failed:", err);
    return { ok: false, error: "تعذّر الاتصال بقاعدة البيانات، حاول لاحقًا." };
  }
  if (existing) return { ok: false, error: "هذا البريد مسجّل مسبقًا" };

  const salt = randomBytes(16).toString("hex");
  try {
    const user = await prisma.user.create({
      data: {
        id: `usr-${randomUUID().slice(0, 8)}-${randomUUID().slice(0, 4)}`,
        name: (input.name ?? "").trim() || "عميلة",
        email,
        salt,
        hash: hashPassword(input.password, salt),
        role: "customer",
      },
    });
    return { ok: true, user };
  } catch (err) {
    console.error("[db] createUser insert failed:", err);
    return { ok: false, error: "تعذّر إنشاء الحساب حاليًا، حاول لاحقًا." };
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
  const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.hash, "hex");
  if (candidate.length !== stored.length) return null;
  return timingSafeEqual(candidate, stored) ? user : null;
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
  };
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
