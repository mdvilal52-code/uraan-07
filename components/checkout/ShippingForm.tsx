"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { saveShippingInfo, getShippingInfo } from "@/lib/checkoutStorage";
import { CheckoutStepper } from "./CheckoutStepper";

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

export function ShippingForm() {
  const router = useRouter();
  const { priced } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  // Prefill from a previous visit to this step, falling back to the
  // signed-in user's details.
  useEffect(() => {
    const saved = getShippingInfo();
    if (saved) {
      setName(saved.name);
      setEmail(saved.email);
      setPhone(saved.phone);
      setAddress(saved.address);
      setCity(saved.city);
      setPostcode(saved.postcode);
    } else if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const subtotal = priced?.subtotal ?? 0;
  const shipping = priced?.shipping ?? 0;
  const total = priced?.total ?? 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveShippingInfo({ name, email, phone, address, city, postcode });
    router.push("/checkout/payment");
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
    <>
      <CheckoutStepper step={1} />
      <form onSubmit={submit} className="space-y-6 px-5 pb-6 pt-3">
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
            <Field
              label="رقم الجوّال"
              type="tel"
              placeholder="+61 4xx xxx xxx"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="section-title text-lg">عنوان الشحن</h2>
          <Field
            label="العنوان"
            placeholder="الشارع، المبنى، الشقة"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="المدينة"
              placeholder="ملبورن"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Field
              label="الرمز البريدي"
              placeholder="3175"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
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
          المتابعة إلى الدفع
          <ArrowLeft className="h-4 w-4" />
        </button>
      </form>
    </>
  );
}
