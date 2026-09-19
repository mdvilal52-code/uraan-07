import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   Image storage (Supabase Storage) for product/banner uploads.
   ------------------------------------------------------------
   Server-side only — the service-role key never reaches the browser.
   Callers (app/api/admin/upload) are already behind requireAdmin().
   ============================================================ */

const BUCKET = "store-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

// MIME type -> the one extension we normalize to and store the object as.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Real magic-byte signature check — never trust a client-supplied MIME
 *  type or filename extension alone (a renamed .exe can still claim
 *  Content-Type: image/png). */
function looksLikeImage(buf: Buffer, ext: string): boolean {
  if (ext === "jpg" || ext === "jpeg") {
    return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (ext === "png") {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return buf.length >= sig.length && sig.every((b, i) => buf[i] === b);
  }
  if (ext === "webp") {
    return (
      buf.length >= 12 &&
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/**
 * Validate + upload an admin-supplied image to Supabase Storage.
 * `label` becomes part of the filename purely for human-readable object
 * names in the Supabase dashboard (e.g. "front", "banner") — the actual
 * uniqueness/collision-safety comes from a server-generated UUID, never
 * from client input, so there's no path-traversal surface at all.
 */
export async function uploadImage(
  file: File,
  opts: { scope: "products" | "banners"; label?: string },
): Promise<UploadResult> {
  const client = getClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Image storage is not configured on this server (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing)",
    };
  }

  if (file.size === 0) return { ok: false, error: "The selected file is empty" };
  if (file.size > MAX_BYTES) return { ok: false, error: "Image must be 5MB or smaller" };

  const ext = ALLOWED_TYPES[file.type];
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !nameExt || !ALLOWED_EXTENSIONS.has(nameExt)) {
    return { ok: false, error: "Unsupported file — use JPG, PNG or WebP" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buffer, ext)) {
    return { ok: false, error: "File does not look like a valid image" };
  }

  const safeLabel =
    (opts.label ?? "image").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30) || "image";
  const path = `${opts.scope}/${randomUUID()}-${safeLabel}.${ext}`;

  const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("[storage] upload failed:", error);
    return { ok: false, error: "Upload failed — please try again" };
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl, path };
}

/** Best-effort cleanup when an image is replaced/removed. Never throws —
 *  a failed delete just leaves a harmless orphaned object in storage. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const client = getClient();
  if (!client) return;
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // not one of our objects (e.g. a local /images/ path)
  const path = url.slice(idx + marker.length);
  try {
    await client.storage.from(BUCKET).remove([path]);
  } catch (err) {
    console.error("[storage] delete failed:", err);
  }
}
