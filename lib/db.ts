import { scryptSync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type {
  CartLine,
  CategorySlug,
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
};

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
  };
}

/* ---------------- Products ---------------- */

export async function listProducts(opts?: {
  category?: string;
  q?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  limit?: number;
}): Promise<Product[]> {
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
    const rows = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "asc" },
      ...(opts?.limit ? { take: opts.limit } : {}),
    });
    return rows.map(toProduct);
  } catch (err) {
    console.error("[db] listProducts failed:", err);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product | undefined> {
  try {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : undefined;
  } catch (err) {
    console.error("[db] getProduct failed:", err);
    return undefined;
  }
}

export async function createProduct(
  input: Partial<Product>,
): Promise<Product> {
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

  try {
    const row = await prisma.product.update({ where: { id }, data });
    return toProduct(row);
  } catch {
    return undefined;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
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
  let rows: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    rows = ids.length
      ? await prisma.product.findMany({ where: { id: { in: ids } } })
      : [];
  } catch (err) {
    console.error("[db] priceCart failed:", err);
  }
  const byId = new Map(rows.map((r) => [r.id, r]));

  const priced: PricedLine[] = [];
  for (const l of lines) {
    const row = byId.get(l.productId);
    if (!row) continue;
    const quantity = Math.max(1, Math.floor(l.quantity));
    priced.push({
      product: toProduct(row),
      quantity,
      lineTotal: row.price * quantity,
    });
  }
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const count = priced.reduce((s, l) => s + l.quantity, 0);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  return { lines: priced, subtotal, shipping, total: subtotal + shipping, count };
}

/* ---------------- Orders ---------------- */

export async function listOrders(limit?: number): Promise<Order[]> {
  try {
    const rows = await prisma.order.findMany({
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
}): Promise<Order> {
  const priced = await priceCart(input.lines);
  const count = await prisma.order.count();
  const id = `AR-${10242 + count}`;

  const row = await prisma.order.create({
    data: {
      id,
      customer: input.customer || "زائر",
      email: input.email || "guest@example.com",
      total: priced.total,
      status: "paid",
      date: new Date().toISOString().slice(0, 10),
      items: priced.count,
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
  return toOrder(row);
}

/* ---------------- Customers ---------------- */

export async function listCustomers(): Promise<Customer[]> {
  try {
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
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "بيانات ناقصة" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "هذا البريد مسجّل مسبقًا" };

  const salt = randomBytes(16).toString("hex");
  const user = await prisma.user.create({
    data: {
      id: `usr-${randomUUID().slice(0, 8)}`,
      name: input.name.trim() || "عميلة",
      email,
      salt,
      hash: hashPassword(input.password, salt),
      role: "customer",
    },
  });
  return { ok: true, user };
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user) return null;
  const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.hash, "hex");
  if (candidate.length !== stored.length) return null;
  return timingSafeEqual(candidate, stored) ? user : null;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(24).toString("hex");
  await prisma.session.create({ data: { token, userId } });
  return token;
}

export async function getUserByToken(
  token?: string | null,
): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    return session?.user ?? null;
  } catch (err) {
    console.error("[db] getUserByToken failed:", err);
    return null;
  }
}

export async function destroySession(token?: string | null): Promise<void> {
  if (!token) return;
  await prisma.session.deleteMany({ where: { token } });
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
  const e = email.trim().toLowerCase();
  if (!e) return false;
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
