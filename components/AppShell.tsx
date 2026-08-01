"use client";

import { Navbar } from "./navbar";
import { BottomNav } from "./BottomNav";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Mobile-first app canvas: sticky top navbar, scrollable content, and a
 * sticky bottom navigation — all constrained to a centered phone-width
 * shell so the design reads identically on tablet and desktop.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-cream-200">
      <div className="app-shell flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
