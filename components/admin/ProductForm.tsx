"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { categories } from "@/data/jewelleryData";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Product } from "@/types";

const GOLD_PURITIES = ["24K", "22K", "21K", "18K", "14K"] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pricingMode, setPricingMode] = useState<"fixed" | "gold_rate">(
    product?.pricingMode ?? "fixed",
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      latin: fd.get("latin"),
      description: fd.get("description"),
      price: Number(fd.get("price")) || 0,
      compareAt: fd.get("compareAt") ? Number(fd.get("compareAt")) : undefined,
      category: fd.get("category"),
      image: fd.get("image") || product?.image,
      imageLeft: fd.get("imageLeft") ?? "",
      imageRight: fd.get("imageRight") ?? "",
      imageBack: fd.get("imageBack") ?? "",
      bestSeller: fd.get("bestSeller") === "on",
      newArrival: fd.get("newArrival") === "on",
      // Admin-controlled karat(s) + gold weights. Sent as-is (raw value);
      // the API normalizes them — karats accepts a comma-separated list
      // and falls back to 21K on the product page when left blank; weights
      // are stored null when left blank → N/A. "Arabic Gold" itself is
      // fixed storewide and isn't part of this form.
      karats: fd.get("karats") ?? "",
      goldWeight: fd.get("goldWeight") ?? "",
      totalWeight: fd.get("totalWeight") ?? "",
      pricingMode: fd.get("pricingMode") === "gold_rate" ? "gold_rate" : "fixed",
      pricingKarat: fd.get("pricingKarat") || undefined,
    };

    const res = await fetch(
      product ? `/api/products/${product.id}` : "/api/products",
      {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Unable to save");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-5">
          <Field label="Product Name">
            <input
              name="name"
              className={inputCls}
              defaultValue={product?.name}
              placeholder="Diamond Statement Necklace"
              required
            />
          </Field>
          <Field label="Short / Alternate Name (optional)">
            <input
              name="latin"
              className={inputCls}
              defaultValue={product?.latin}
              placeholder="Diamond Statement Necklace"
            />
          </Field>
          <Field label="Description">
            <textarea
              name="description"
              rows={4}
              className={`${inputCls} resize-none`}
              defaultValue={product?.description}
              placeholder="Product description…"
            />
          </Field>
        </div>

        <div className="card space-y-4 p-5">
          <Field label="Pricing Type">
            <select
              name="pricingMode"
              className={inputCls}
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as "fixed" | "gold_rate")}
            >
              <option value="fixed">Fixed Price</option>
              <option value="gold_rate">Gold Rate Based</option>
            </select>
            <span className="mt-1 block text-[0.7rem] text-ink-faint">
              {pricingMode === "gold_rate"
                ? "Price is computed live from Gold Weight below × the current Admin → Gold Rate for the purity chosen underneath. The Price field becomes a fallback only, used if weight or rate is missing."
                : "Price is exactly what you type below — it never changes on its own."}
            </span>
          </Field>
          {pricingMode === "gold_rate" && (
            <Field label="Pricing Karat">
              <select
                name="pricingKarat"
                className={inputCls}
                defaultValue={product?.pricingKarat ?? "21K"}
              >
                {GOLD_PURITIES.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[0.7rem] text-ink-faint">
                Which Admin → Gold Rate row prices this product. Set Gold
                Weight below — required for a live price.
              </span>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label={pricingMode === "gold_rate" ? "Fallback Price (AUD)" : "Price (AUD)"}>
              <input
                name="price"
                type="number"
                className={inputCls}
                defaultValue={product?.price}
                placeholder="2450"
                required
              />
            </Field>
            <Field label="Compare-at Price (AUD)">
              <input
                name="compareAt"
                type="number"
                className={inputCls}
                defaultValue={product?.compareAt}
                placeholder="—"
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              name="category"
              className={inputCls}
              defaultValue={product?.category ?? "necklaces"}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Exactly four dedicated views per product — never a generic
            unlimited gallery. Front is required (it's what every product
            card/listing shows); the other three are optional and only
            appear in the product-detail gallery. */}
        <div className="card space-y-4 p-5">
          <h3 className="text-sm font-bold text-ink">Product Images</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Front View"
              name="image"
              slotLabel="front"
              scope="products"
              initialUrl={product?.image}
              required
            />
            <ImageUploadField
              label="Left Side View"
              name="imageLeft"
              slotLabel="left"
              scope="products"
              initialUrl={product?.imageLeft}
            />
            <ImageUploadField
              label="Right Side View"
              name="imageRight"
              slotLabel="right"
              scope="products"
              initialUrl={product?.imageRight}
            />
            <ImageUploadField
              label="Back View"
              name="imageBack"
              slotLabel="back"
              scope="products"
              initialUrl={product?.imageBack}
            />
          </div>
        </div>

        {/* Karat + gold weights — control the "Weight & Purity" box on the
            product page. Leave a field blank to show N/A (weights) or the
            21K default (karat) there. "Arabic Gold" is not set here — it's
            a fixed badge shown automatically on every product page. */}
        <div className="card space-y-4 p-5">
          <h3 className="text-sm font-bold text-ink">Weight &amp; Purity Details</h3>
          <p className="text-xs text-ink-muted">
            <strong>Arabic Gold</strong> is shown automatically on every product
            and can&apos;t be changed here — set the karat and weights below.
          </p>
          <Field label="Karat">
            <input
              name="karats"
              className={inputCls}
              defaultValue={product?.karats?.join(", ")}
              placeholder="21K"
            />
            <span className="mt-1 block text-[0.7rem] text-ink-faint">
              Type the karat as you like, e.g. 21K or 18K. Separate multiple
              with commas (21K, 18K) to show more than one badge. Leave blank
              to default to 21K.
            </span>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gold Weight (grams)">
              <input
                name="goldWeight"
                type="number"
                step="0.1"
                min="0"
                className={inputCls}
                defaultValue={product?.goldWeight}
                placeholder="—"
              />
            </Field>
            <Field label="Total Weight (grams)">
              <input
                name="totalWeight"
                type="number"
                step="0.1"
                min="0"
                className={inputCls}
                defaultValue={product?.totalWeight}
                placeholder="—"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-3 p-5">
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Best Seller</span>
            <input
              name="bestSeller"
              type="checkbox"
              defaultChecked={product?.bestSeller}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">New Arrival</span>
            <input
              name="newArrival"
              type="checkbox"
              defaultChecked={product?.newArrival}
              className="h-4 w-4 accent-forest-600"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-forest w-full disabled:opacity-60">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Product
            </>
          )}
        </button>
        <Link href="/admin/products" className="btn-outline w-full">
          Cancel
        </Link>
      </div>
    </form>
  );
}
