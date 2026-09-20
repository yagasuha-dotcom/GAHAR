import { NextResponse } from "next/server";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [tot] = (
    await db.execute<{
      total_revenue: string;
      total_orders: string;
      total_customers: string;
      today_orders: string;
      products_sold: string;
    }>(sql`
    SELECT
      COALESCE(SUM(CASE WHEN status IN ('PAID','DELIVERED','COMPLETED') THEN total ELSE 0 END),0)::text as total_revenue,
      COUNT(*)::text as total_orders,
      (SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER')::text as total_customers,
      (SELECT COUNT(*) FROM orders WHERE created_at::date = CURRENT_DATE)::text as today_orders,
      COALESCE((SELECT SUM(sold_count) FROM products),0)::text as products_sold
    FROM orders
  `)
  ).rows;

  const weekly = (
    await db.execute<{ day: string; revenue: string }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') as day,
           COALESCE(SUM(o.total), 0)::text as revenue
    FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') d
    LEFT JOIN orders o ON o.created_at::date = d::date AND o.status IN ('PAID','DELIVERED','COMPLETED')
    GROUP BY d
    ORDER BY d
  `)
  ).rows;

  const topGames = (
    await db.execute<{ game: string; sold: string }>(sql`
    SELECT game, SUM(sold_count)::text as sold
    FROM products
    GROUP BY game
    ORDER BY SUM(sold_count) DESC
    LIMIT 5
  `)
  ).rows;

  return NextResponse.json({ tot, weekly, topGames });
}
