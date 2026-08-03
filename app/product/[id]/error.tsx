"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <div className="grid place-items-center px-5 py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-clay-500" />
        <h1 className="mt-4 font-arabic text-xl font-bold text-ink">
          تعذّر تحميل المنتج
        </h1>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          حدث خطأ أثناء تحميل تفاصيل المنتج. حاول مرة أخرى.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          <button type="button" onClick={() => reset()} className="btn-forest w-full">
            <RotateCcw className="h-4 w-4" />
            أعد المحاولة
          </button>
          <Link href="/shop" className="btn-outline w-full">
            العودة إلى المتجر
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
