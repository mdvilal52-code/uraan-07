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
        <h1 className="mt-4 font-sans text-xl font-bold text-ink">
          Unable to Load Product
        </h1>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          Something went wrong while loading the product details. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
          <button type="button" onClick={() => reset()} className="btn-forest w-full">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link href="/shop" className="btn-outline w-full">
            Back to Shop
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
