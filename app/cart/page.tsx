import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "السلة",
  description: "راجع قطعك المختارة وأكمل عملية الشراء.",
};

export default function CartPage() {
  return (
    <AppShell>
      <header className="px-5 pb-3 pt-5">
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          سلّة التسوّق
        </h1>
      </header>
      <CartView />
    </AppShell>
  );
}
