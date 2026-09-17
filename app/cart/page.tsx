import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected pieces and complete your purchase.",
};

export default function CartPage() {
  return (
    <AppShell>
      <header className="px-5 pb-3 pt-5">
        <h1 className="font-sans text-[1.7rem] font-extrabold text-ink">
          Shopping Cart
        </h1>
      </header>
      <CartView />
    </AppShell>
  );
}
