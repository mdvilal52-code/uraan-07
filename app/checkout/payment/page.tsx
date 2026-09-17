import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PaymentForm } from "@/components/checkout/PaymentForm";

export const metadata: Metadata = {
  title: "Payment",
  description: "Complete your payment securely.",
};

export default function CheckoutPaymentPage() {
  return (
    <AppShell>
      <header className="px-5 pb-1 pt-5">
        <h1 className="font-sans text-[1.7rem] font-extrabold text-ink">
          Checkout
        </h1>
      </header>
      <PaymentForm />
    </AppShell>
  );
}
