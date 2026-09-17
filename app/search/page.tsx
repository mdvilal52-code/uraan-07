import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for jewellery and gemstones at Ariana.",
};

export default function SearchPage() {
  return (
    <AppShell>
      <header className="px-5 pb-3 pt-5">
        <h1 className="font-sans text-[1.7rem] font-extrabold text-ink">Search</h1>
      </header>
      <SearchView />
    </AppShell>
  );
}
