import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = {
  title: "بحث",
  description: "ابحث عن المجوهرات والأحجار الكريمة في متجر أريانا.",
};

export default function SearchPage() {
  return (
    <AppShell>
      <header className="px-5 pb-3 pt-5">
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">بحث</h1>
      </header>
      <SearchView />
    </AppShell>
  );
}
