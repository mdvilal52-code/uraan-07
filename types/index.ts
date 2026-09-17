/* Shared domain types for the Ariana jewellery storefront. */

export type CategorySlug =
  | "necklaces"
  | "earrings"
  | "rings"
  | "bracelets"
  | "pendants"
  | "gems";

export type GemSurface = "gold" | "dark" | "cream";

export interface Category {
  slug: CategorySlug;
  /** Display name shown in the UI */
  name: string;
  /** short label (for admin/alt text) */
  latin: string;
  /** lucide-style icon key resolved in the UI */
  icon: string;
  /** optional real photo shown in the category circle instead of the icon */
  image?: string;
}

export interface Product {
  id: string;
  name: string; // Display name
  latin: string; // Short/alt name (alt text / admin)
  category: CategorySlug;
  price: number; // AUD
  compareAt?: number; // AUD — original/strike price
  description: string;
  /** placeholder tint until a real photo is dropped in public/images */
  surface: GemSurface;
  /** expected image path (drop real HD photo here) */
  image: string;
  tags?: string[];
  bestSeller?: boolean;
  newArrival?: boolean;
  rating?: number;
  reviews?: number;
  /** Legacy per-product purity list. No longer surfaced anywhere — the
   *  product page shows a fixed "21K + Arabic Gold" purity label for every
   *  product. Kept optional on the type/DB only for backward compatibility. */
  karats?: string[];
  /** Net gold weight in grams (admin-controlled; undefined → N/A). */
  goldWeight?: number;
  /** Gross/total weight in grams (admin-controlled; undefined → N/A). */
  totalWeight?: number;
}

export interface Collection {
  id: string;
  name: string;
  latin: string;
  description: string;
  price: number; // AUD (starting)
  surface: GemSurface;
  image: string;
}

export interface Exhibition {
  id: string;
  title: string;
  dateLabel: string; // e.g. "Saturday, June 15"
  timeLabel: string; // e.g. "10:00 AM"
  venue: string;
  day: string; // "15"
  month: string; // "June"
}

export interface QuickAction {
  label: string;
  icon: string;
  href: string;
}

/* ---- Cart / commerce ---- */
export interface CartLine {
  productId: string;
  quantity: number;
}

/* ---- Admin mock domain ---- */
export interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: number;
  couponCode?: string;
  discount?: number;
  /** Account that placed the order (undefined for guest checkout). */
  userId?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
}
