"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageSquare, Trash2, Copy, Check } from "lucide-react";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface NewsletterRow {
  email: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Contact-form submissions and newsletter signups: both were already
 *  written to Postgres (app/api/contact, app/api/newsletter) but had no
 *  admin UI to ever view them. Read-only + delete for contact messages
 *  (nothing on the storefront lets a customer edit/withdraw one). */
export function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessageRow[] | null>(null);
  const [signups, setSignups] = useState<NewsletterRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setMessages([]));
    fetch("/api/newsletter")
      .then((r) => r.json())
      .then((d) => setSignups(d.signups ?? []))
      .catch(() => setSignups([]));
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    setBusy(id);
    const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
    if (res.ok) setMessages((cur) => cur?.filter((m) => m.id !== id) ?? cur);
    setBusy(null);
  }

  async function copyAllEmails() {
    if (!signups?.length) return;
    try {
      await navigator.clipboard.writeText(signups.map((s) => s.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be unavailable (insecure context / permissions) */
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="font-sans text-base font-bold text-ink">
          Contact Messages {messages ? `(${messages.length})` : ""}
        </h3>
        {!messages ? (
          <div className="card grid place-items-center py-16 text-ink-muted">
            <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="card grid place-items-center py-16 text-center text-ink-muted">
            <MessageSquare className="h-8 w-8 text-cream-400" />
            <p className="mt-3 text-sm">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`card space-y-2 p-4 ${busy === m.id ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-sans font-bold text-ink">{m.name}</p>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-xs font-semibold text-gold-600 hover:underline"
                    >
                      {m.email}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[0.7rem] text-ink-faint">
                      {formatDate(m.createdAt)}
                    </span>
                    <button
                      onClick={() => remove(m.id)}
                      disabled={busy === m.id}
                      aria-label="Delete"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-ink">
            Newsletter Signups {signups ? `(${signups.length})` : ""}
          </h3>
          {signups && signups.length > 0 && (
            <button
              onClick={copyAllEmails}
              className="flex items-center gap-1.5 rounded-xl bg-cream-100 px-3 py-1.5 text-xs font-bold text-ink-soft transition hover:bg-cream-200"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-forest-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy all emails"}
            </button>
          )}
        </div>
        {!signups ? (
          <div className="card grid place-items-center py-16 text-ink-muted">
            <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
          </div>
        ) : signups.length === 0 ? (
          <div className="card grid place-items-center py-16 text-center text-ink-muted">
            <Mail className="h-8 w-8 text-cream-400" />
            <p className="mt-3 text-sm">No signups yet.</p>
          </div>
        ) : (
          <div className="card divide-y divide-cream-200">
            {signups.map((s) => (
              <div key={s.email} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-ink">{s.email}</span>
                <span className="text-[0.7rem] text-ink-faint">
                  {formatDate(s.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
