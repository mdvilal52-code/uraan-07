"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product } from "@/types";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PricedLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

interface Priced {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
}

interface CartValue {
  items: CartItem[];
  priced: Priced | null;
  count: number;
  ready: boolean;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const empty: Priced = {
  lines: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  count: 0,
};

const CartContext = createContext<CartValue | null>(null);
const KEY = "ariana_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [priced, setPriced] = useState<Priced | null>(null);
  const [ready, setReady] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // persist
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  // price via backend (products are the pricing source of truth)
  useEffect(() => {
    if (!ready) return;
    if (items.length === 0) {
      setPriced(empty);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (!ignore) setPriced(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [items, ready]);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing)
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, qty) }
          : i,
      ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, priced, count, ready, add, setQty, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
