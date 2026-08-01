"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="px-5 py-5">
      <div className="overflow-hidden rounded-3xl bg-forest-gradient p-6 text-center text-cream-50">
        <h2 className="font-arabic text-xl font-bold text-cream-50">
          انضمّي إلى نشرتنا البريدية
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-cream-200/85">
          كوني أوّل من يعلم بأحدث المجموعات والعروض الحصرية.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim()) return;
            try {
              await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
            } catch {
              /* ignore */
            }
            setDone(true);
            setEmail("");
            setTimeout(() => setDone(false), 2500);
          }}
          className="mx-auto mt-4 flex max-w-sm items-center gap-2 rounded-2xl bg-cream-50 p-1.5"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الإلكتروني"
            aria-label="البريد الإلكتروني"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            aria-label="اشتراك"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-600 text-cream-50 transition active:scale-95"
          >
            {done ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </section>
  );
}
