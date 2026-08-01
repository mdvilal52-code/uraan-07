import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { products as seedProducts } from "@/data/jewelleryData";
import { orders as seedOrders } from "@/lib/orders";
import { customers as seedCustomers } from "@/lib/users";
import type { CartLine, Customer, Order, Product } from "@/types";

/* ============================================================
   In-memory data store (single source of truth at runtime).

   Seeded from the static content files. Persisted on globalThis so
   it survives dev hot-reloads and is shared across API routes within
   a running server. Swap the internals of this module for a real
   database (Prisma/Postgres, etc.) without touching callers.
   ============================================================ */

export interface User {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Newsletter {
  email: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface Store {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  users: User[];
  sessions: Map<string, string>; // token -> userId
  newsletters: Newsletter[];
  contacts: ContactMessage[];
}

function seed(): Store {
  return {
    products: seedProducts.map((p) => ({ ...p })),
    orders: seedOrders.map((o) => ({ ...o })),
    customers: seedCustomers.map((c) => ({ ...c })),
    users: [],
    sessions: new Map(),
    newsletters: [],
    contacts: [],
  };
}

const g = globalThis as unknown as { __arianaStore?: Store };
const store: Store = g.__arianaStore ?? (g.__arianaStore = seed());

/* ---------------- Products ---------------- */

export function listProducts(opts?: {
  category?: string;
  q?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
  limit?: number;
}): Product[] {
  let items = store.products;
  if (opts?.category && opts.category !== "all") {
    items = items.filter((p) => p.category === opts.category);
  }
  if (opts?.bestSeller) items = items.filter((p) => p.bestSeller);
  if (opts?.newArrival) items = items.filter((p) => p.newArrival);
  if (opts?.q) {
    const q = opts.q.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.latin.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }
  return typeof opts?.limit === "number" ? items.slice(0, opts.limit) : items;
}

export function getProduct(id: string): Product | undefined {
  return store.products.find((p) => p.id === id);
}

export function createProduct(input: Partial<Product>): Product {
  const product: Product = {
    id: input.id?.trim() || `prd-${randomUUID().slice(0, 8)}`,
    name: input.name ?? "منتج جديد",
    latin: input.latin ?? "New Product",
    category: (input.category as Product["category"]) ?? "necklaces",
    price: Number(input.price) || 0,
    compareAt: input.compareAt ? Number(input.compareAt) : undefined,
    description: input.description ?? "",
    surface: (input.surface as Product["surface"]) ?? "gold",
    image: input.image ?? "/images/necklace.svg",
    tags: input.tags ?? [],
    bestSeller: Boolean(input.bestSeller),
    newArrival: Boolean(input.newArrival),
    rating: input.rating ?? 5,
    reviews: input.reviews ?? 0,
  };
  store.products.unshift(product);
  return product;
}

export function updateProduct(
  id: string,
  patch: Partial<Product>,
): Product | undefined {
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const next = { ...store.products[idx], ...patch, id };
  if (patch.price !== undefined) next.price = Number(patch.price) || 0;
  store.products[idx] = next;
  return next;
}

export function deleteProduct(id: string): boolean {
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.products.splice(idx, 1);
  return true;
}

/* ---------------- Cart pricing ---------------- */

export interface PricedLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export function priceCart(lines: CartLine[]): {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
} {
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const product = getProduct(l.productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.floor(l.quantity));
    priced.push({ product, quantity, lineTotal: product.price * quantity });
  }
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const count = priced.reduce((s, l) => s + l.quantity, 0);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  return { lines: priced, subtotal, shipping, total: subtotal + shipping, count };
}

/* ---------------- Orders ---------------- */

export function listOrders(limit?: number): Order[] {
  const items = [...store.orders].sort((a, b) => b.date.localeCompare(a.date));
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export function createOrder(input: {
  customer: string;
  email: string;
  lines: CartLine[];
}): Order {
  const { total, count } = priceCart(input.lines);
  const seq = 10242 + store.orders.length;
  const order: Order = {
    id: `AR-${seq}`,
    customer: input.customer || "زائر",
    email: input.email || "guest@example.com",
    total,
    status: "paid",
    date: new Date().toISOString().slice(0, 10),
    items: count,
  };
  store.orders.unshift(order);
  return order;
}

/* ---------------- Customers ---------------- */

export function listCustomers(): Customer[] {
  return store.customers;
}

/* ---------------- Auth ---------------- */

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
}): { ok: true; user: User } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return { ok: false, error: "بيانات ناقصة" };
  if (store.users.some((u) => u.email === email))
    return { ok: false, error: "هذا البريد مسجّل مسبقًا" };
  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: `usr-${randomUUID().slice(0, 8)}`,
    name: input.name.trim() || "عميلة",
    email,
    salt,
    hash: hashPassword(input.password, salt),
    role: "customer",
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  return { ok: true, user };
}

export function verifyUser(email: string, password: string): User | null {
  const user = store.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user) return null;
  const candidate = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.hash, "hex");
  if (candidate.length !== stored.length) return null;
  return timingSafeEqual(candidate, stored) ? user : null;
}

export function createSession(userId: string): string {
  const token = randomBytes(24).toString("hex");
  store.sessions.set(token, userId);
  return token;
}

export function getUserByToken(token?: string | null): User | null {
  if (!token) return null;
  const userId = store.sessions.get(token);
  if (!userId) return null;
  return store.users.find((u) => u.id === userId) ?? null;
}

export function destroySession(token?: string | null): void {
  if (token) store.sessions.delete(token);
}

export function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/* ---------------- Misc capture ---------------- */

export function addNewsletter(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!e) return false;
  if (!store.newsletters.some((n) => n.email === e))
    store.newsletters.push({ email: e, createdAt: new Date().toISOString() });
  return true;
}

export function addContact(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const msg: ContactMessage = {
    id: `msg-${randomUUID().slice(0, 8)}`,
    name: input.name,
    email: input.email,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  store.contacts.push(msg);
  return msg;
}

/* ---------------- Analytics ---------------- */

export function analytics() {
  const revenue = store.orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const valid = store.orders.filter((o) => o.status !== "cancelled").length;
  return {
    revenue,
    orders: store.orders.length,
    customers: store.customers.length,
    products: store.products.length,
    averageOrderValue: valid ? Math.round(revenue / valid) : 0,
  };
}
