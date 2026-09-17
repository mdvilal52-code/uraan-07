import type { Coupon } from "@/types";

/* Seed coupon data — loaded into the Coupon table on first `db:seed` run. */
export const coupons: Coupon[] = [
  {
    code: "ARIANA15",
    description: "15% off all orders",
    discountType: "percent",
    value: 15,
    minSubtotal: 0,
    maxUses: 500,
    usedCount: 128,
    active: true,
  },
  {
    code: "BRIDE20",
    description: "20% off the bridal collection",
    discountType: "percent",
    value: 20,
    minSubtotal: 0,
    maxUses: 100,
    usedCount: 42,
    active: true,
  },
  {
    code: "WELCOME10",
    description: "10% off for new customers",
    discountType: "percent",
    value: 10,
    minSubtotal: 0,
    usedCount: 310,
    active: true,
  },
  {
    code: "EID25",
    description: "25% off for Eid",
    discountType: "percent",
    value: 25,
    minSubtotal: 0,
    maxUses: 200,
    usedCount: 0,
    active: true,
    expiresAt: "2026-05-01T00:00:00.000Z",
  },
];
