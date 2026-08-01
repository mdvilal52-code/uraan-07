"use client";

import { useState } from "react";
import { Save, ImagePlus, CheckCircle2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

export function BannerForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
      className="card space-y-4 p-5"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink-soft">
          عنوان البانر
        </span>
        <input className={inputCls} placeholder="تألّقي للأبد" required />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink-soft">
          النص الفرعي
        </span>
        <input className={inputCls} placeholder="بريقٌ لا ينتهي" />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">
            نص الزر
          </span>
          <input className={inputCls} placeholder="تسوّقي الآن" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-ink-soft">
            الرابط
          </span>
          <input className={inputCls} placeholder="/shop" />
        </label>
      </div>

      <div>
        <span className="mb-1 block text-xs font-bold text-ink-soft">
          صورة الخلفية
        </span>
        <div className="grid h-40 place-items-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-100 text-ink-muted">
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs">ارفع صورة البانر (1600×900)</span>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-forest w-full sm:w-auto">
        {saved ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> تم الحفظ
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> حفظ البانر
          </>
        )}
      </button>
    </form>
  );
}
