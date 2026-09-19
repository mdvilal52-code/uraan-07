import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteBanner, updateBanner } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = await req.json().catch(() => ({}));
  const result = await updateBanner(params.id, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.notFound ? 404 : 400 },
    );
  }
  // The homepage hero (components/Hero.tsx) reads the active banner directly.
  revalidatePath("/");
  return NextResponse.json({ banner: result.banner });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const ok = await deleteBanner(params.id);
  if (ok) revalidatePath("/");
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
