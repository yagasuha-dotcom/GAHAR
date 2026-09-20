import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  products,
  orders,
  orderItems,
  payments,
  coupons,
  notifications,
} from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, desc } from "drizzle-orm";
import { generateOrderCode } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  productId: z.number().int().positive(),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER", "EWALLET"]),
  couponCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const session = await getSession();

    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, data.productId))
      .limit(1);
    if (!p) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    if (p.stock <= 0 || p.status !== "AVAILABLE")
      return NextResponse.json({ error: "Stok habis" }, { status: 400 });

    const price = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
    let discount = 0;
    let couponCodeApplied: string | null = null;

    if (data.couponCode) {
      const [c] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, data.couponCode.toUpperCase()))
        .limit(1);
      if (c && c.active && price >= c.minPurchase && (c.maxUse === 0 || c.usedCount < c.maxUse)) {
        discount = c.type === "PERCENT" ? Math.floor((price * c.value) / 100) : c.value;
        couponCodeApplied = c.code;
        await db
          .update(coupons)
          .set({ usedCount: c.usedCount + 1 })
          .where(eq(coupons.id, c.id));
      }
    }

    const uniqueCode = Math.floor(Math.random() * 500) + 1;
    const subtotal = price;
    const total = Math.max(0, subtotal - discount) + uniqueCode;

    // sequence
    const [countRow] = (
      await db.execute<{ count: string }>(sql`SELECT COUNT(*)::text as count FROM orders`)
    ).rows as { count: string }[];
    const seq = parseInt(countRow.count) + 1;
    const orderCode = generateOrderCode(seq);

    const deadline = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const [order] = await db
      .insert(orders)
      .values({
        orderCode,
        userId: session?.id ?? null,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        subtotal,
        discount,
        uniqueCode,
        total,
        status: "WAITING_PAYMENT",
        couponCode: couponCodeApplied,
        paymentMethod: data.paymentMethod,
        paymentDeadline: deadline,
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: p.id,
      productName: p.name,
      productImage: p.images?.[0] ?? null,
      price,
      quantity: 1,
    });

    await db.insert(payments).values({
      orderId: order.id,
      method: data.paymentMethod,
      amount: total,
      status: "PENDING",
    });

    await db.insert(notifications).values({
      forAdmin: true,
      type: "ORDER",
      title: "Pesanan Baru",
      message: `Order ${orderCode} sebesar Rp${total.toLocaleString("id-ID")} menunggu pembayaran`,
      link: `/admin/orders/${order.id}`,
    });

    return NextResponse.json({ ok: true, orderCode, orderId: order.id });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ items: [] }, { status: 401 });
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.id))
    .orderBy(desc(orders.createdAt));
  return NextResponse.json({ items: rows });
}
