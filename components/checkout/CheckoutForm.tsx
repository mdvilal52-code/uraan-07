"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Wallet, Banknote, CheckCircle2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

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
  const { items, priced, clear } = useCart();
  const { user } = useAuth();
  const [pay, setPay] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState<{ id: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const subtotal = priced?.subtotal ?? 0;
  const shipping = priced?.shipping ?? 0;
  const total = priced?.total ?? 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: name || user?.name,
          email: email || user?.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        clear();
      }
    } finally {
      setPlacing(false);
    }
  }

  if (order) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <CheckCircle2 className="h-16 w-16 text-forest-500" />
        <h2 className="mt-4 font-arabic text-xl font-bold text-ink">
          تمّ تأكيد طلبك!
        </h2>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          رقم طلبك <span className="font-bold text-ink">{order.id}</span>. شكرًا
          لتسوّقك من أريانا، سنرسل تفاصيل الشحن إلى بريدك قريبًا.
        </p>
        <Link href="/" className="btn-forest mt-6">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  if (priced && priced.lines.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-cream-400" />
        <p className="mt-4 text-ink-muted">سلّتك فارغة، أضِف بعض القطع أولًا.</p>
        <Link href="/shop" className="btn-forest mt-5">
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 px-5 pb-6">
      <section className="space-y-3">
        <h2 className="section-title text-lg">معلومات التواصل</h2>
        <Field
          label="الاسم الكامل"
          placeholder="نورة القحطاني"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="البريد الإلكتروني"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field label="رقم الجوّال" type="tel" placeholder="+61 4xx xxx xxx" required />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title text-lg">عنوان الشحن</h2>
        <Field label="العنوان" placeholder="الشارع، المبنى، الشقة" required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="المدينة" placeholder="ملبورن" required />
          <Field label="الرمز البريدي" placeholder="3175" />
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

      <button type="submit" disabled={placing} className="btn-forest w-full disabled:opacity-60">
        {placing ? "جارٍ تأكيد الطلب…" : `تأكيد الطلب · ${formatPrice(total)}`}
      </button>
    </form>
  );
}
