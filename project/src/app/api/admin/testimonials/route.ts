import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(120),
  role: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  message: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const d = schema.parse(body);
    const [t] = await db.insert(testimonials).values(d).returning();
    return NextResponse.json({ ok: true, testimonial: t });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
