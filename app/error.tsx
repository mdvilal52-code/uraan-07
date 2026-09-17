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
        <h1 className="mt-4 font-sans text-xl font-bold text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          We&apos;re sorry for the inconvenience. Please try again, and contact us if the problem continues.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-ink-faint">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={() => reset()} className="btn-forest w-full">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link href="/" className="btn-outline w-full">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
