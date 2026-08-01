"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Wallet, Banknote, CheckCircle2 } from "lucide-react";
import { products } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

const summary = [
  { id: "nk-diamond-maas", qty: 1 },
  { id: "er-maas", qty: 2 },
  { id: "rg-solitaire", qty: 1 },
];

const payments = [
  { key: "card", label: "بطاقة ائتمان", icon: CreditCard },
  { key: "wallet", label: "محفظة إلكترونية", icon: Wallet },
  { key: "cod", label: "الدفع عند الاستلام", icon: Banknote },
];

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-soft">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint"
      />
    </label>
  );
}

export function CheckoutForm() {
  const [pay, setPay] = useState("card");
  const [placed, setPlaced] = useState(false);

  const rows = summary.map((s) => ({
    product: products.find((p) => p.id === s.id)!,
    qty: s.qty,
  }));
  const subtotal = rows.reduce((s, r) => s + r.product.price * r.qty, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (placed) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-forest-500" />
        <h2 className="mt-4 font-arabic text-xl font-bold text-ink">
          تمّ تأكيد طلبك!
        </h2>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          شكرًا لتسوّقك من أريانا. سنرسل تفاصيل الشحن إلى بريدك الإلكتروني قريبًا.
        </p>
        <Link href="/" className="btn-forest mt-6">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setPlaced(true);
      }}
      className="space-y-6 px-5 pb-6"
    >
      <section className="space-y-3">
        <h2 className="section-title text-lg">معلومات التواصل</h2>
        <Field label="الاسم الكامل" placeholder="نورة القحطاني" required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="البريد الإلكتروني" type="email" placeholder="you@example.com" required />
          <Field label="رقم الجوّال" type="tel" placeholder="+971 5x xxx xxxx" required />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title text-lg">عنوان الشحن</h2>
        <Field label="العنوان" placeholder="الشارع، المبنى، الشقة" required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="المدينة" placeholder="دبي" required />
          <Field label="الرمز البريدي" placeholder="00000" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title text-lg">طريقة الدفع</h2>
        <div className="space-y-2">
          {payments.map((p) => (
            <button
              type="button"
              key={p.key}
              onClick={() => setPay(p.key)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition ${
                pay === p.key
                  ? "border-forest-500 bg-forest-50"
                  : "border-cream-300 bg-cream-50"
              }`}
            >
              <p.icon
                className={`h-5 w-5 ${pay === p.key ? "text-forest-600" : "text-ink-muted"}`}
              />
              <span className="flex-1 text-sm font-bold text-ink">{p.label}</span>
              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  pay === p.key
                    ? "border-forest-500 bg-forest-500"
                    : "border-cream-400"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      <div className="card space-y-2 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">المجموع الفرعي</span>
          <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">الشحن</span>
          <span className="font-semibold text-ink">
            {shipping === 0 ? "مجّاني" : formatPrice(shipping)}
          </span>
        </div>
        <div className="hr-gold my-1" />
        <div className="flex items-center justify-between">
          <span className="font-arabic font-bold text-ink">الإجمالي</span>
          <span className="price text-xl">{formatPrice(total)}</span>
        </div>
      </div>

      <button type="submit" className="btn-forest w-full">
        تأكيد الطلب · {formatPrice(total)}
      </button>
    </form>
  );
}
