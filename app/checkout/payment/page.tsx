import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PaymentForm } from "@/components/checkout/PaymentForm";

export const metadata: Metadata = {
  title: "الدفع",
  description: "أكملي عملية الدفع بأمان.",
};

export default function CheckoutPaymentPage() {
  return (
    <AppShell>
      <header className="px-5 pb-1 pt-5">
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          إتمام الشراء
        </h1>
      </header>
      <PaymentForm />
    </AppShell>
  );
}
