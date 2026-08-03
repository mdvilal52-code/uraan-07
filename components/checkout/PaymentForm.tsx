"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  ShoppingBag,
  Lock,
  Pencil,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import {
  getShippingInfo,
  clearShippingInfo,
  getCouponCode,
  saveCouponCode,
  clearCouponCode,
  type ShippingInfo,
} from "@/lib/checkoutStorage";
import { CheckoutStepper } from "./CheckoutStepper";

interface AppliedCoupon {
  code: string;
  description: string;
  discount: number;
}

const methods = [
  { key: "card", label: "بطاقة ائتمان", icon: CreditCard },
  { key: "wallet", label: "محفظة إلكترونية", icon: Wallet },
  { key: "cod", label: "الدفع عند الاستلام", icon: Banknote },
] as const;

type Method = (typeof methods)[number]["key"];

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

function formatCardNumber(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function formatCvv(v: string): string {
  return v.replace(/\D/g, "").slice(0, 4);
}

export function PaymentForm() {
  const router = useRouter();
  const { items, priced, selectedPriced, removeMany } = useCart();
  const selectedIds = new Set(
    (selectedPriced?.lines ?? []).map((l) => l.product.id),
  );
  const selectedItems = items.filter((i) => selectedIds.has(i.productId));

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [method, setMethod] = useState<Method>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [walletPhone, setWalletPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ id: string } | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // No shipping info means the customer skipped step 1 — send them back.
  useEffect(() => {
    const saved = getShippingInfo();
    if (!saved) {
      router.replace("/checkout");
      return;
    }
    setShippingInfo(saved);
  }, [router]);

  const subtotal = selectedPriced?.subtotal ?? 0;
  const shipping = selectedPriced?.shipping ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  const applyCoupon = useCallback(
    async (rawCode: string, opts?: { silent?: boolean }) => {
      const code = rawCode.trim();
      if (!code) {
        if (!opts?.silent) setCouponError("أدخلي كود الخصم");
        return;
      }
      setCouponLoading(true);
      if (!opts?.silent) setCouponError("");
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal }),
        });
        const data = await res.json();
        if (data.ok) {
          setAppliedCoupon({
            code: data.code,
            description: data.description,
            discount: data.discount,
          });
          setCouponInput(data.code);
          setCouponError("");
          saveCouponCode(data.code);
        } else {
          setAppliedCoupon(null);
          clearCouponCode();
          if (!opts?.silent) setCouponError(data.error ?? "كود الخصم غير صالح");
        }
      } catch {
        if (!opts?.silent)
          setCouponError("تعذّر الاتصال بالخادم، تحقّقي من الإنترنت.");
      } finally {
        setCouponLoading(false);
      }
    },
    [subtotal],
  );

  // Restore a previously-applied coupon (from step redo / page refresh) once
  // the cart has a real subtotal to validate it against.
  const restoredCouponRef = useRef(false);
  useEffect(() => {
    if (restoredCouponRef.current || subtotal <= 0) return;
    restoredCouponRef.current = true;
    const saved = getCouponCode();
    if (saved) applyCoupon(saved, { silent: true });
  }, [subtotal, applyCoupon]);

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    clearCouponCode();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!shippingInfo || selectedItems.length === 0) return;
    setError("");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems,
          customer: shippingInfo.name,
          email: shippingInfo.email,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر إتمام الطلب، حاولي مرة أخرى.");
        return;
      }
      setOrder(data.order);
      removeMany(selectedItems.map((i) => i.productId));
      clearShippingInfo();
      clearCouponCode();
    } catch {
      setError("تعذّر الاتصال بالخادم، تحقّقي من الإنترنت.");
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

  if (selectedPriced && selectedPriced.lines.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-cream-400" />
        <p className="mt-4 text-ink-muted">
          لم تختاري أي منتج للشراء. عودي إلى السلة واختاري منتجًا واحدًا على الأقل.
        </p>
        <Link href="/cart" className="btn-forest mt-5">
          العودة إلى السلة
        </Link>
      </div>
    );
  }

  if (!shippingInfo) return null; // redirecting to /checkout

  return (
    <>
      <CheckoutStepper step={2} />
      <form onSubmit={submit} className="space-y-6 px-5 pb-6 pt-3">
        {/* Shipping summary */}
        <section className="card flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              الشحن إلى
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{shippingInfo.name}</p>
            <p className="text-sm text-ink-soft">
              {shippingInfo.address}
              {shippingInfo.city ? `، ${shippingInfo.city}` : ""}
              {shippingInfo.postcode ? ` ${shippingInfo.postcode}` : ""}
            </p>
            {shippingInfo.phone && (
              <p dir="ltr" className="text-start text-sm text-ink-soft">
                {shippingInfo.phone}
              </p>
            )}
          </div>
          <Link
            href="/checkout"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-clay-500"
          >
            <Pencil className="h-3.5 w-3.5" /> تعديل
          </Link>
        </section>

        {/* Payment method */}
        <section className="space-y-3">
          <h2 className="section-title text-lg">طريقة الدفع</h2>
          <div className="space-y-2">
            {methods.map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition ${
                  method === m.key
                    ? "border-forest-500 bg-forest-50"
                    : "border-cream-300 bg-cream-50"
                }`}
              >
                <m.icon
                  className={`h-5 w-5 ${method === m.key ? "text-forest-600" : "text-ink-muted"}`}
                />
                <span className="flex-1 text-sm font-bold text-ink">{m.label}</span>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${
                    method === m.key
                      ? "border-forest-500 bg-forest-500"
                      : "border-cream-400"
                  }`}
                />
              </button>
            ))}
          </div>

          {method === "card" && (
            <div className="space-y-3 rounded-2xl border border-cream-300 bg-cream-50 p-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-soft">
                  رقم البطاقة
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
                  <CreditCard className="h-4 w-4 shrink-0 text-ink-muted" />
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="flex-1 bg-transparent text-sm tracking-wider outline-none placeholder:text-ink-faint"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-soft">
                  الاسم على البطاقة
                </span>
                <input
                  dir="ltr"
                  autoComplete="cc-name"
                  required
                  placeholder="NOURA ALQAHTANI"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className={`${inputCls} uppercase`}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-soft">
                    تاريخ الانتهاء
                  </span>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink-soft">
                    CVV
                  </span>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    type="password"
                    autoComplete="cc-csc"
                    required
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(formatCvv(e.target.value))}
                    className={inputCls}
                  />
                </label>
              </div>
            </div>
          )}

          {method === "wallet" && (
            <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-soft">
                  رقم الجوّال المرتبط بالمحفظة
                </span>
                <input
                  dir="ltr"
                  type="tel"
                  required
                  placeholder="+61 4xx xxx xxx"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value)}
                  className={inputCls}
                />
              </label>
            </div>
          )}

          {method === "cod" && (
            <p className="rounded-2xl bg-cream-100 px-4 py-3 text-sm text-ink-soft">
              ادفعي نقدًا عند استلام طلبك من المندوب.
            </p>
          )}

          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Lock className="h-3.5 w-3.5 text-forest-500" />
            معلومات الدفع مشفّرة وآمنة.
          </p>
        </section>

        {/* Coupon code */}
        <section className="card space-y-3 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Tag className="h-4 w-4 text-forest-600" />
            كود الخصم
          </h2>

          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-extrabold tracking-wider text-forest-700">
                  {appliedCoupon.code}
                </p>
                <p className="text-xs text-forest-600">{appliedCoupon.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-forest-700">
                  -{formatPrice(appliedCoupon.discount)}
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label="إزالة كود الخصم"
                  className="grid h-7 w-7 place-items-center rounded-lg bg-white/70 text-forest-700 transition hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  dir="ltr"
                  type="text"
                  placeholder="ARIANA15"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (couponError) setCouponError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCoupon(couponInput);
                    }
                  }}
                  aria-label="كود الخصم"
                  aria-invalid={couponError ? true : undefined}
                  className={`${inputCls} flex-1 uppercase tracking-wider`}
                />
                <button
                  type="button"
                  disabled={couponLoading || !couponInput.trim()}
                  onClick={() => applyCoupon(couponInput)}
                  className="btn-forest shrink-0 px-5 disabled:opacity-60"
                >
                  {couponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "تطبيق"
                  )}
                </button>
              </div>
              {couponError && (
                <p role="alert" className="text-xs font-semibold text-red-600">
                  {couponError}
                </p>
              )}
            </>
          )}
        </section>

        <div className="card space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">المجموع الفرعي</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">خصم ({appliedCoupon.code})</span>
              <span className="font-semibold text-forest-600">
                -{formatPrice(discount)}
              </span>
            </div>
          )}
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

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={placing}
          className="btn-forest w-full disabled:opacity-60"
        >
          {placing ? "جارٍ تأكيد الطلب…" : `تأكيد الدفع · ${formatPrice(total)}`}
        </button>
      </form>
    </>
  );
}
