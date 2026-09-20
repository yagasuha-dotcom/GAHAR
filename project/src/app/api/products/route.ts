import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, desc, eq, gte, lte, ilike, or, sql, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const game = sp.get("game");
  const q = sp.get("q");
  const rank = sp.get("rank");
  const region = sp.get("region");
  const inStock = sp.get("inStock");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const sort = sp.get("sort") || "latest";
  const page = parseInt(sp.get("page") || "1", 10);
  const limit = Math.min(parseInt(sp.get("limit") || "24", 10), 100);

  const conds = [eq(products.status, "AVAILABLE" as const)];
  if (game) conds.push(eq(products.game, game));
  if (rank) conds.push(eq(products.rank, rank));
  if (region) conds.push(eq(products.region, region));
  if (inStock === "1") conds.push(gte(products.stock, 1));
  if (minPrice) conds.push(gte(products.price, parseInt(minPrice)));
  if (maxPrice) conds.push(lte(products.price, parseInt(maxPrice)));
  if (q) {
    const like = `%${q}%`;
    const searchCond = or(
      ilike(products.name, like),
      ilike(products.game, like),
      ilike(products.description, like),
    );
    if (searchCond) conds.push(searchCond);
  }

  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
        ? desc(products.price)
        : sort === "bestseller"
          ? desc(products.soldCount)
          : desc(products.createdAt);

  const where = and(...conds);
  const offset = (page - 1) * limit;

  const [rows, countRow] = await Promise.all([
    db.select().from(products).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.execute<{ count: string }>(
      sql`SELECT COUNT(*)::text as count FROM products WHERE status = 'AVAILABLE'`,
    ),
  ]);

  const total = parseInt((countRow.rows[0] as { count: string }).count);

  return NextResponse.json({
    items: rows,
    page,
    limit,
    total,
    hasMore: offset + rows.length < total,
  });
}
