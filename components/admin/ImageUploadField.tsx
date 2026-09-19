"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X, ImageOff } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * A single image slot: preview + select/replace/remove + upload progress +
 * validation, backed by POST /api/admin/upload (Supabase Storage). Renders
 * a hidden `name`-matching input carrying the resulting URL, so the parent
 * form's existing FormData-based submit needs no changes at all — this is
 * a drop-in replacement for what used to be a plain text URL input.
 */
export function ImageUploadField({
  label,
  name,
  initialUrl,
  scope,
  slotLabel,
  required = false,
}: {
  label: string;
  name: string;
  initialUrl?: string;
  scope: "products" | "banners";
  /** Short filename hint sent to the upload API, e.g. "front"/"banner". */
  slotLabel: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use JPG, PNG or WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("scope", scope);
      fd.set("label", slotLabel);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Upload failed — check your connection and try again");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1 block text-xs font-bold text-ink-soft">
        {label}
        {required && <span className="text-clay-500"> *</span>}
      </span>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 shrink-0">
          {url ? (
            <ProductImage
              src={url}
              ratio="square"
              rounded="rounded-xl"
              label={label}
              className="h-20 w-20"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-cream-300 bg-cream-50 text-ink-faint">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-2">
            <label className="btn-outline cursor-pointer px-3 py-2 text-xs">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : url ? "Replace" : "Select image"}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            {url && !uploading && !required && (
              <button
                type="button"
                onClick={() => setUrl("")}
                aria-label={`Remove ${label}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {error && <p className="text-[0.7rem] font-semibold text-red-600">{error}</p>}
          <p className="text-[0.65rem] text-ink-faint">JPG, PNG or WebP · up to 5MB</p>
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
