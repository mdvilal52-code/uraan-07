import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Generous but bounded — an admin editing a product with 4 image slots
// plus retries shouldn't hit this, but it stops a compromised/scripted
// admin session from hammering storage.
const UPLOAD_LIMIT = { limit: 40, windowMs: 15 * 60 * 1000, lockoutMs: 15 * 60 * 1000 };

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const rl = checkRateLimit(`upload:${gate.id}`, UPLOAD_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many uploads — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const scope = form?.get("scope");
  const label = form?.get("label");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (scope !== "products" && scope !== "banners") {
    return NextResponse.json({ error: "Invalid upload scope" }, { status: 400 });
  }

  const result = await uploadImage(file, {
    scope,
    label: typeof label === "string" ? label : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}
