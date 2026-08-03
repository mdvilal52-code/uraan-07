import { PrismaClient } from "@prisma/client";
import { products } from "../data/jewelleryData";
import { orders } from "../lib/orders";
import { customers } from "../lib/users";
import { coupons } from "../lib/coupons";

const prisma = new PrismaClient();

async function main() {
  // Skip on an already-populated database (safe to run on every deploy).
  // Set SEED_FORCE=1 to re-seed / upsert regardless.
  const force = process.env.SEED_FORCE === "1" || process.env.SEED_FORCE === "true";
  const existing = await prisma.product.count();
  if (existing > 0 && !force) {
    console.log(
      `Products already present (${existing}); skipping seed. Set SEED_FORCE=1 to override.`,
    );
    return;
  }

  // Products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
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
      },
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
      },
    });
  }

  // Customers
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        email: c.email,
        orders: c.orders,
        spent: c.spent,
        joined: c.joined,
      },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        orders: c.orders,
        spent: c.spent,
        joined: c.joined,
      },
    });
  }

  // Historical orders (no line items)
  for (const o of orders) {
    await prisma.order.upsert({
      where: { id: o.id },
      update: {
        customer: o.customer,
        email: o.email,
        total: o.total,
        status: o.status,
        date: o.date,
        items: o.items,
      },
      create: {
        id: o.id,
        customer: o.customer,
        email: o.email,
        total: o.total,
        status: o.status,
        date: o.date,
        items: o.items,
      },
    });
  }

  // Coupons
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        description: c.description,
        discountType: c.discountType,
        value: c.value,
        minSubtotal: c.minSubtotal,
        maxUses: c.maxUses ?? null,
        usedCount: c.usedCount,
        active: c.active,
        expiresAt: c.expiresAt ? new Date(c.expiresAt) : null,
      },
      create: {
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        value: c.value,
        minSubtotal: c.minSubtotal,
        maxUses: c.maxUses ?? null,
        usedCount: c.usedCount,
        active: c.active,
        expiresAt: c.expiresAt ? new Date(c.expiresAt) : null,
      },
    });
  }

  const [pc, cc, oc, kc] = await Promise.all([
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.coupon.count(),
  ]);
  console.log(`Seeded: ${pc} products, ${cc} customers, ${oc} orders, ${kc} coupons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
