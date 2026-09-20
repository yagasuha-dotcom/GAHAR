import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) patch.status = body.status;
  if (body.internalNotes !== undefined) patch.internalNotes = body.internalNotes;
  const [o] = await db
    .update(orders)
    .set(patch)
    .where(eq(orders.id, parseInt(id)))
    .returning();
  return NextResponse.json({ ok: true, order: o });
}
