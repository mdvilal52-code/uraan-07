"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ImagePlus, Loader2 } from "lucide-react";
import { categories } from "@/data/jewelleryData";
import type { Product } from "@/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      latin: fd.get("latin"),
      description: fd.get("description"),
      price: Number(fd.get("price")) || 0,
      compareAt: fd.get("compareAt") ? Number(fd.get("compareAt")) : undefined,
      category: fd.get("category"),
      image: fd.get("image") || product?.image,
      bestSeller: fd.get("bestSeller") === "on",
      newArrival: fd.get("newArrival") === "on",
    };

    const res = await fetch(
      product ? `/api/products/${product.id}` : "/api/products",
      {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "تعذّر الحفظ");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-5">
          <Field label="اسم المنتج (عربي)">
            <input
              name="name"
              className={inputCls}
              defaultValue={product?.name}
              placeholder="قلادة ماس ألماسي"
              required
            />
          </Field>
          <Field label="الاسم بالإنجليزية">
            <input
              name="latin"
              className={inputCls}
              defaultValue={product?.latin}
              placeholder="Diamond Maas Necklace"
            />
          </Field>
          <Field label="الوصف">
            <textarea
              name="description"
              rows={4}
              className={`${inputCls} resize-none`}
              defaultValue={product?.description}
              placeholder="وصف المنتج…"
            />
          </Field>
        </div>

        <div className="card space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="السعر (AUD)">
              <input
                name="price"
                type="number"
                className={inputCls}
                defaultValue={product?.price}
                placeholder="2450"
                required
              />
            </Field>
            <Field label="سعر المقارنة (AUD)">
              <input
                name="compareAt"
                type="number"
                className={inputCls}
                defaultValue={product?.compareAt}
                placeholder="—"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الفئة">
              <select
                name="category"
                className={inputCls}
                defaultValue={product?.category ?? "necklaces"}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="مسار الصورة">
              <input
                name="image"
                className={inputCls}
                defaultValue={product?.image}
                placeholder="/images/necklace.svg"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <span className="mb-2 block text-xs font-bold text-ink-soft">
            صورة المنتج
          </span>
          <div className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-100 text-ink-muted">
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="h-8 w-8" />
              <span className="text-xs">اسحب الصورة أو انقر للرفع</span>
            </div>
          </div>
        </div>

        <div className="card space-y-3 p-5">
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">الأكثر مبيعًا</span>
            <input
              name="bestSeller"
              type="checkbox"
              defaultChecked={product?.bestSeller}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">وصل حديثًا</span>
            <input
              name="newArrival"
              type="checkbox"
              defaultChecked={product?.newArrival}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-forest w-full disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الحفظ…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> حفظ المنتج
            </>
          )}
        </button>
        <Link href="/admin/products" className="btn-outline w-full">
          إلغاء
        </Link>
      </div>
    </form>
  );
}
