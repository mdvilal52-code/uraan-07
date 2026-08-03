"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error boundary caught:", error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-cream-200 px-5 text-center">
      <div className="max-w-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-clay-500" />
        <h1 className="mt-4 font-arabic text-xl font-bold text-ink">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          نعتذر عن الإزعاج. حاولي مرة أخرى، وإذا استمرت المشكلة تواصلي معنا.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-ink-faint" dir="ltr">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={() => reset()} className="btn-forest w-full">
            <RotateCcw className="h-4 w-4" />
            أعد المحاولة
          </button>
          <Link href="/" className="btn-outline w-full">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
