/** Shipping details captured on the checkout step, read on the payment step. */
export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
}

const KEY = "ariana_checkout_shipping";

export function saveShippingInfo(info: ShippingInfo): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(info));
  } catch {
    /* storage may be unavailable (private mode, quota, embedded webview) */
  }
}

export function getShippingInfo(): ShippingInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ShippingInfo) : null;
  } catch {
    return null;
  }
}

export function clearShippingInfo(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/* Applied coupon code — only the code is persisted; the discount itself is
   always re-validated against the live subtotal (server is the source of
   truth), so a stale/expired code never silently keeps an old discount. */
const COUPON_KEY = "ariana_checkout_coupon";

export function saveCouponCode(code: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COUPON_KEY, code);
  } catch {
    /* storage may be unavailable (private mode, quota, embedded webview) */
  }
}

export function getCouponCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(COUPON_KEY);
  } catch {
    return null;
  }
}

export function clearCouponCode(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(COUPON_KEY);
  } catch {
    /* ignore */
  }
}
