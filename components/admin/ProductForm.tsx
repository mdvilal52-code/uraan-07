"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, ImagePlus, CheckCircle2 } from "lucide-react";
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
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
      className="grid gap-5 lg:grid-cols-3"
    >
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-5">
          <Field label="اسم المنتج (عربي)">
            <input
              className={inputCls}
              defaultValue={product?.name}
              placeholder="قلادة ماس ألماسي"
              required
            />
          </Field>
          <Field label="الاسم بالإنجليزية">
            <input
              className={inputCls}
              defaultValue={product?.latin}
              placeholder="Diamond Maas Necklace"
            />
          </Field>
          <Field label="الوصف">
            <textarea
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
                type="number"
                className={inputCls}
                defaultValue={product?.price}
                placeholder="2450"
                required
              />
            </Field>
            <Field label="سعر المقارنة (AUD)">
              <input
                type="number"
                className={inputCls}
                defaultValue={product?.compareAt}
                placeholder="—"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="الفئة">
              <select className={inputCls} defaultValue={product?.category}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المخزون">
              <input type="number" className={inputCls} defaultValue={24} />
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
              type="checkbox"
              defaultChecked={product?.bestSeller}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">وصل حديثًا</span>
            <input
              type="checkbox"
              defaultChecked={product?.newArrival}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
        </div>

        <button type="submit" className="btn-forest w-full">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> تم الحفظ
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> حفظ المنتج
            </>
          )}
        </button>
        <Link
          href="/admin/products"
          className="btn-outline w-full"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
