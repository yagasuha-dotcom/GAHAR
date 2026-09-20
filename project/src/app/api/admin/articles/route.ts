import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(220),
  thumbnail: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1),
  category: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(articles).orderBy(desc(articles.createdAt));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin().catch(() => null);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const d = schema.parse(body);
    const slug = `${slugify(d.title)}-${Date.now().toString(36)}`;
    const [a] = await db
      .insert(articles)
      .values({ ...d, slug, authorId: session.id })
      .returning();
    return NextResponse.json({ ok: true, article: a });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
