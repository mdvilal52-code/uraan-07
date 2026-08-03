import type { Coupon } from "@/types";

/* Seed coupon data — loaded into the Coupon table on first `db:seed` run. */
export const coupons: Coupon[] = [
  {
    code: "ARIANA15",
    description: "خصم 15% على كل الطلبات",
    discountType: "percent",
    value: 15,
    minSubtotal: 0,
    maxUses: 500,
    usedCount: 128,
    active: true,
  },
  {
    code: "BRIDE20",
    description: "خصم 20% على مجموعة الزفاف",
    discountType: "percent",
    value: 20,
    minSubtotal: 0,
    maxUses: 100,
    usedCount: 42,
    active: true,
  },
  {
    code: "WELCOME10",
    description: "خصم 10% للعملاء الجدد",
    discountType: "percent",
    value: 10,
    minSubtotal: 0,
    usedCount: 310,
    active: true,
  },
  {
    code: "EID25",
    description: "خصم 25% بمناسبة العيد",
    discountType: "percent",
    value: 25,
    minSubtotal: 0,
    maxUses: 200,
    usedCount: 0,
    active: true,
    expiresAt: "2026-05-01T00:00:00.000Z",
  },
];
