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
  tax: number;
  total: number;
  count: number;
}

interface CartValue {
  items: CartItem[];
  priced: Priced | null;
  /** Totals for only the checked-off lines — what actually proceeds to checkout. */
  selectedPriced: Priced | null;
  count: number;
  ready: boolean;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  removeMany: (productIds: string[]) => void;
  clear: () => void;
  isSelected: (productId: string) => boolean;
  toggleSelected: (productId: string) => void;
}

const empty: Priced = {
  lines: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  count: 0,
};

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode, quota, embedded webview) */
  }
}

const CartContext = createContext<CartValue | null>(null);
const KEY = "ariana_cart";
const SELECTED_KEY = "ariana_cart_selected";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [priced, setPriced] = useState<Priced | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const rawSel = localStorage.getItem(SELECTED_KEY);
      if (rawSel) setSelected(JSON.parse(rawSel));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // persist
  useEffect(() => {
    if (ready) safeSetItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (ready) safeSetItem(SELECTED_KEY, JSON.stringify(selected));
  }, [selected, ready]);

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

  const [selectedPriced, setSelectedPriced] = useState<Priced | null>(null);

  // Totals for only the checked-off lines. Re-priced via the same backend
  // endpoint (not re-derived locally) so shipping threshold, tax and
  // gold-rate product pricing stay authoritative and in sync with the full
  // cart price instead of duplicating that logic client-side. When nothing
  // is deselected this is just the full cart price — no extra request.
  useEffect(() => {
    if (!ready) return;
    const allSelected = items.every((i) => selected[i.productId] !== false);
    if (allSelected) {
      setSelectedPriced(priced);
      return;
    }
    const selectedItems = items.filter((i) => selected[i.productId] !== false);
    if (selectedItems.length === 0) {
      setSelectedPriced(empty);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: selectedItems }),
        });
        const data = await res.json();
        if (!ignore) setSelectedPriced(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [items, selected, ready, priced]);

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
    setSelected((prev) => {
      if (!(productId in prev)) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const removeMany = useCallback((productIds: string[]) => {
    const idSet = new Set(productIds);
    setItems((prev) => prev.filter((i) => !idSet.has(i.productId)));
    setSelected((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of productIds) {
        if (id in next) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setSelected({});
  }, []);

  const isSelected = useCallback(
    (productId: string) => selected[productId] !== false,
    [selected],
  );

  const toggleSelected = useCallback((productId: string) => {
    setSelected((prev) => {
      const current = prev[productId] !== false;
      return { ...prev, [productId]: !current };
    });
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        priced,
        selectedPriced,
        count,
        ready,
        add,
        setQty,
        remove,
        removeMany,
        clear,
        isSelected,
        toggleSelected,
      }}
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
