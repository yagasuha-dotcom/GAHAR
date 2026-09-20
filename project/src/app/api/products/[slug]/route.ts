import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, sql, ne, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // increment view count (non-blocking style)
  db.execute(sql`UPDATE products SET view_count = view_count + 1 WHERE id = ${p.id}`).catch(() => {});

  const [related, rvs] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.game, p.game), ne(products.id, p.id)))
      .limit(4),
    db.select().from(reviews).where(eq(reviews.productId, p.id)).limit(20),
  ]);

  // Strip credentials from public payload
  const { credentials: _credentials, ...safe } = p;
  void _credentials;

  return NextResponse.json({ product: safe, related, reviews: rvs });
}
