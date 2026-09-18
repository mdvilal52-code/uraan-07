"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Trash2, Pencil, X, ImageIcon } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import type { GemSurface } from "@/types";

interface BannerRow {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  image?: string;
  surface: string;
  status: string;
  createdAt: string;
}

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

/** Promotional banners an admin can create/edit/delete. The storefront home
 *  page hero (components/Hero.tsx) renders whichever banner here has
 *  status "Active" and was created most recently, falling back to default
 *  copy when none is active. */
export function BannersPanel() {
  const [banners, setBanners] = useState<BannerRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<BannerRow | null>(null);

  const load = () =>
    fetch("/api/banners")
      .then((r) => r.json())
      .then((d) => setBanners(d.banners ?? []))
      .catch(() => setBanners([]));

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    setBusy(id);
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editing?.id === id) setEditing(null);
      await load();
    }
    setBusy(null);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = {
      title: fd.get("title"),
      subtitle: fd.get("subtitle") || undefined,
      buttonText: fd.get("buttonText") || undefined,
      link: fd.get("link") || undefined,
      image: fd.get("image") || undefined,
      surface: fd.get("surface") || "gold",
      status: fd.get("status") || "active",
    };
    const res = await fetch(
      editing ? `/api/banners/${editing.id}` : "/api/banners",
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Unable to save this banner");
      return;
    }
    form.reset();
    setEditing(null);
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h3 className="font-sans text-base font-bold text-ink">Current Banners</h3>
        {!banners ? (
          <div className="card grid place-items-center py-16 text-ink-muted">
            <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
          </div>
        ) : banners.length === 0 ? (
          <div className="card grid place-items-center py-16 text-center text-ink-muted">
            <ImageIcon className="h-8 w-8 text-cream-400" />
            <p className="mt-3 text-sm">No banners yet — add one on the right.</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className={`card flex items-center gap-3 p-3 ${busy === b.id ? "opacity-50" : ""} ${editing?.id === b.id ? "ring-2 ring-gold-400" : ""}`}
            >
              <ProductImage
                src={b.image}
                surface={(b.surface as GemSurface) || "gold"}
                icon="gem"
                ratio="landscape"
                rounded="rounded-xl"
                className="h-16 w-24 shrink-0"
                label={b.title}
              />
              <div className="flex-1">
                <p className="font-sans font-bold text-ink">{b.title}</p>
                <span
                  className={`text-xs ${b.status === "active" ? "text-forest-500" : "text-ink-faint"}`}
                >
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
              </div>
              <button
                onClick={() => setEditing((cur) => (cur?.id === b.id ? null : b))}
                aria-label="Edit"
                className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(b.id)}
                disabled={busy === b.id}
                aria-label="Delete"
                className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-ink">
            {editing ? "Edit Banner" : "Add New Banner"}
          </h3>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex items-center gap-1 text-xs font-bold text-ink-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" /> Cancel edit
            </button>
          )}
        </div>
        <form
          key={editing?.id ?? "new"}
          onSubmit={submit}
          className="card space-y-4 p-5"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Banner Title
            </span>
            <input
              name="title"
              className={inputCls}
              placeholder="Shine Forever"
              defaultValue={editing?.title}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">Subtitle</span>
            <input
              name="subtitle"
              className={inputCls}
              placeholder="Brilliance Without End"
              defaultValue={editing?.subtitle}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink-soft">
                Button Text
              </span>
              <input
                name="buttonText"
                className={inputCls}
                placeholder="Shop Now"
                defaultValue={editing?.buttonText}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink-soft">Link</span>
              <input
                name="link"
                className={inputCls}
                placeholder="/shop"
                defaultValue={editing?.link}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Background Image Path
            </span>
            <input
              name="image"
              className={inputCls}
              placeholder="/images/collection-royal.jpg"
              defaultValue={editing?.image}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink-soft">Status</span>
              <select
                name="status"
                defaultValue={editing?.status ?? "active"}
                className={inputCls}
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-ink-soft">Surface</span>
              <select
                name="surface"
                defaultValue={editing?.surface ?? "gold"}
                className={inputCls}
              >
                <option value="gold">Gold</option>
                <option value="dark">Dark</option>
                <option value="cream">Cream</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-forest w-full sm:w-auto disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : editing ? "Update Banner" : "Save Banner"}
          </button>
        </form>
      </div>
    </div>
  );
}
