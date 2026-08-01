import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "الدفع",
  description: "أكمل عملية الشراء بأمان.",
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <header className="px-5 pb-4 pt-5">
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          إتمام الشراء
        </h1>
      </header>
      <CheckoutForm />
    </AppShell>
  );
}
