import Link from "next/link";
import { LotusMark } from "@/components/icons/JewelIcons";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream-200 px-6">
      <div className="flex flex-col items-center text-center">
        <LotusMark className="h-16 w-16 animate-float" />
        <p className="mt-6 font-serif text-6xl font-semibold text-ink">404</p>
        <h1 className="mt-2 font-sans text-xl font-bold text-ink">
          Page Not Found
        </h1>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link href="/" className="btn-forest mt-6">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
