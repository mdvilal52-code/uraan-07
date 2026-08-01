"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Topbar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cream-300 bg-cream-50/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="القائمة"
          className="grid h-10 w-10 place-items-center rounded-xl text-ink transition hover:bg-cream-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="flex-1 font-arabic text-lg font-bold text-ink">{title}</h1>

        <div className="hidden items-center gap-2 rounded-xl border border-cream-300 bg-cream-100 px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-ink-muted" />
          <input
            placeholder="بحث…"
            aria-label="بحث"
            className="w-40 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          />
        </div>

        <button
          aria-label="الإشعارات"
          className="relative grid h-10 w-10 place-items-center rounded-xl text-ink transition hover:bg-cream-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-clay-500" />
        </button>

        <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient font-arabic text-sm font-extrabold text-forest-800">
          أ
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 start-0 flex">
            <div className="relative" onClick={() => setOpen(false)}>
              <Sidebar variant="drawer" />
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="absolute -end-12 top-3 grid h-10 w-10 place-items-center rounded-xl bg-cream-50 text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
