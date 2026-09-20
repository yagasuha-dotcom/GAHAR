import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  game: z.string().min(2),
  categoryId: z.number().int().nullable().optional(),
  rank: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  level: z.number().int().optional(),
  skins: z.number().int().optional(),
  heroes: z.number().int().optional(),
  items: z.number().int().optional(),
  diamonds: z.number().int().optional(),
  description: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional().nullable(),
  price: z.number().int().positive(),
  discountPrice: z.number().int().nullable().optional(),
  stock: z.number().int().min(0).default(1),
  isFlashSale: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  credentials: z
    .object({
      login: z.string().optional(),
      password: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(products).orderBy(desc(products.createdAt));
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
    const slug = `${slugify(d.name)}-${Date.now().toString(36)}`;
    const [p] = await db
      .insert(products)
      .values({
        ...d,
        slug,
        images: d.images ?? [],
      })
      .returning();
    return NextResponse.json({ ok: true, product: p });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
