import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders, orderItems, products } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ ok: false, error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const d = schema.parse(body);

    const [product] = await db.select().from(products).where(eq(products.id, d.productId));
    if (!product) {
      return NextResponse.json({ ok: false, error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Only allow review if the user has a paid order containing this product.
    const purchased = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, user.id),
          eq(orderItems.productId, d.productId),
          eq(orders.status, "PAID"),
        ),
      )
      .limit(1);

    if (purchased.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Kamu hanya bisa mengulas produk yang sudah dibeli" },
        { status: 403 },
      );
    }

    const [review] = await db
      .insert(reviews)
      .values({
        productId: d.productId,
        userId: user.id,
        userName: user.name || "Pengguna",
        rating: d.rating,
        comment: d.comment || null,
      })
      .returning();

    return NextResponse.json({ ok: true, review });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
