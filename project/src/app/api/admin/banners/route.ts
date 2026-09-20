import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  position: z.string().default("HERO"),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(banners).orderBy(asc(banners.sortOrder));
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
    const [b] = await db.insert(banners).values(d).returning();
    return NextResponse.json({ ok: true, banner: b });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
