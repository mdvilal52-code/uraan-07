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
  sessionStorage.setItem(KEY, JSON.stringify(info));
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
  sessionStorage.removeItem(KEY);
}
