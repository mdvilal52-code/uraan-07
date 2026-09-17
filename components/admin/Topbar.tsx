"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Topbar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-cream-300 bg-cream-50/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          className="grid h-10 w-10 place-items-center rounded-xl text-ink transition hover:bg-cream-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="flex-1 font-sans text-lg font-bold text-ink">{title}</h1>

        <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient font-sans text-sm font-extrabold text-forest-800">
          A
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
                aria-label="Close"
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
