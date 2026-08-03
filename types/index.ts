/* Shared domain types for the Ariana jewellery storefront. */

export type CategorySlug =
  | "necklaces"
  | "earrings"
  | "rings"
  | "bracelets"
  | "pendants";

export type GemSurface = "gold" | "dark" | "cream";

export interface Category {
  slug: CategorySlug;
  /** Arabic display name */
  name: string;
  /** short Latin label (for admin/alt text) */
  latin: string;
  /** lucide-style icon key resolved in the UI */
  icon: string;
}

export interface Product {
  id: string;
  name: string; // Arabic
  latin: string; // Latin (alt text / admin)
  category: CategorySlug;
  price: number; // AUD
  compareAt?: number; // AUD — original/strike price
  description: string; // Arabic
  /** placeholder tint until a real photo is dropped in public/images */
  surface: GemSurface;
  /** expected image path (drop real HD photo here) */
  image: string;
  tags?: string[];
  bestSeller?: boolean;
  newArrival?: boolean;
  rating?: number;
  reviews?: number;
}

export interface Collection {
  id: string;
  name: string; // Arabic
  latin: string;
  description: string; // Arabic
  price: number; // AUD (starting)
  surface: GemSurface;
  image: string;
}

export interface Exhibition {
  id: string;
  title: string; // Arabic
  dateLabel: string; // Arabic day label e.g. "السبت، 15 يونيو"
  timeLabel: string; // Arabic e.g. "10:00 صباحًا"
  venue: string;
  day: string; // "15"
  month: string; // "يونيو"
}

export interface QuickAction {
  label: string; // Arabic
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
