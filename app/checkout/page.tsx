import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ShippingForm } from "@/components/checkout/ShippingForm";

export const metadata: Metadata = {
  title: "Shipping & Contact",
  description: "Enter your shipping address and contact details to complete your order.",
};

export default function CheckoutPage() {
  return (
    <AppShell>
      <header className="px-5 pb-1 pt-5">
        <h1 className="font-sans text-[1.7rem] font-extrabold text-ink">
          Checkout
        </h1>
      </header>
      <ShippingForm />
    </AppShell>
  );
}
