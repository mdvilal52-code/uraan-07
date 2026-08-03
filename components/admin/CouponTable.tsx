"use client";

import { useEffect, useState } from "react";
import { Plus, Ticket, Copy, Check, Trash2, Loader2, X } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import type { Coupon } from "@/types";

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

function isCouponActive(c: Coupon): boolean {
  if (!c.active) return false;
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) return false;
  if (c.maxUses != null && c.usedCount >= c.maxUses) return false;
  return true;
}

function CouponForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      code: fd.get("code"),
      description: fd.get("description"),
      discountType: fd.get("discountType"),
      value: Number(fd.get("value")) || 0,
      minSubtotal: fd.get("minSubtotal") ? Number(fd.get("minSubtotal")) : 0,
      maxUses: fd.get("maxUses") ? Number(fd.get("maxUses")) : null,
      expiresAt: fd.get("expiresAt") || null,
    };
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "تعذّر إنشاء الكوبون");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">الكود</span>
          <input
            name="code"
            required
            placeholder="SUMMER30"
            className={`${inputCls} uppercase`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">الوصف</span>
          <input
            name="description"
            required
            placeholder="خصم 30% على المجموعة الصيفية"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">نوع الخصم</span>
          <select name="discountType" defaultValue="percent" className={inputCls}>
            <option value="percent">نسبة مئوية %</option>
            <option value="fixed">مبلغ ثابت (AUD)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">القيمة</span>
          <input
            name="value"
            type="number"
            min={1}
            required
            placeholder="15"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">
            الحد الأدنى للطلب (AUD)
          </span>
          <input name="minSubtotal" type="number" min={0} placeholder="0" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">
            الحد الأقصى للاستخدام
          </span>
          <input name="maxUses" type="number" min={1} placeholder="بلا حدود" className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-bold text-ink-soft">
            تاريخ الانتهاء (اختياري)
          </span>
          <input name="expiresAt" type="date" className={inputCls} />
        </label>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-forest flex-1 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء الكوبون"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">
          إلغاء
        </button>
      </div>
    </form>
  );
}

export function CouponTable() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons ?? []))
      .catch(() => setCoupons([]));

  useEffect(() => {
    load();
  }, []);

  async function remove(code: string) {
    if (!confirm("حذف هذا الكوبون؟")) return;
    setBusy(code);
    await fetch(`/api/coupons/${code}`, { method: "DELETE" });
    await load();
    setBusy(null);
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      /* clipboard may be unavailable (insecure context / permissions) */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">إدارة كوبونات الخصم</p>
        <button className="btn-forest" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "إغلاق" : "كوبون جديد"}
        </button>
      </div>

      {showForm && (
        <CouponForm
          onDone={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!coupons ? (
        <div className="card grid place-items-center py-16 text-ink-muted">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center text-ink-muted">
          <Ticket className="h-8 w-8 text-cream-400" />
          <p className="mt-3 text-sm">لا توجد كوبونات بعد.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {coupons.map((c) => {
            const active = isCouponActive(c);
            return (
              <div
                key={c.code}
                className={`card flex items-center gap-3 p-4 ${busy === c.code ? "opacity-50" : ""}`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-forest-800">
                  <Ticket className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold tracking-wider text-ink">
                      {c.code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                        active
                          ? "bg-forest-50 text-forest-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {active ? "نشط" : "منتهٍ"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted">{c.description}</p>
                  <p className="mt-0.5 text-[0.7rem] text-ink-faint">
                    الاستخدام: {c.usedCount}/{c.maxUses ?? "∞"} ·{" "}
                    {c.discountType === "fixed"
                      ? formatPrice(c.value)
                      : `${c.value}%`}
                    {c.minSubtotal > 0
                      ? ` · حد أدنى ${formatPrice(c.minSubtotal)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => copy(c.code)}
                    aria-label="نسخ"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
                  >
                    {copied === c.code ? (
                      <Check className="h-4 w-4 text-forest-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => remove(c.code)}
                    aria-label="حذف"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
