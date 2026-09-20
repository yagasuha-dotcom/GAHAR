import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  orders,
  orderItems,
  payments,
  products,
  notifications,
  activityLogs,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// Simulates a successful payment webhook -> triggers automatic delivery
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderCode, code))
    .limit(1);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status === "COMPLETED" || order.status === "DELIVERED") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  // Mark payment success
  await db
    .update(payments)
    .set({ status: "SUCCESS", paidAt: new Date() })
    .where(eq(payments.orderId, order.id));

  // Fetch items & attach credentials from products
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  for (const it of items) {
    if (!it.productId) continue;
    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, it.productId))
      .limit(1);
    if (!p) continue;

    await db
      .update(orderItems)
      .set({
        deliveredData: p.credentials ?? {
          login: "delivered@clintstore.id",
          password: "TempPass123!",
          notes: "Silakan ganti password segera.",
        },
      })
      .where(eq(orderItems.id, it.id));

    // Decrement stock and mark sold
    await db
      .update(products)
      .set({
        stock: Math.max(0, p.stock - it.quantity),
        soldCount: p.soldCount + it.quantity,
        status: p.stock - it.quantity <= 0 ? "SOLD" : p.status,
      })
      .where(eq(products.id, p.id));
  }

  const now = new Date();
  await db
    .update(orders)
    .set({
      status: "COMPLETED",
      paidAt: now,
      deliveredAt: now,
      updatedAt: now,
    })
    .where(eq(orders.id, order.id));

  await db.insert(notifications).values([
    {
      userId: order.userId,
      type: "PAYMENT",
      title: "Pembayaran Berhasil",
      message: `Order ${order.orderCode} telah dibayar. Akun sudah dikirim ke email Anda.`,
      link: `/orders/${order.orderCode}`,
    },
    {
      forAdmin: true,
      type: "PAYMENT",
      title: "Pembayaran Diterima",
      message: `Order ${order.orderCode} telah dibayar & dikirim otomatis`,
      link: `/admin/orders/${order.id}`,
    },
  ]);

  await db.insert(activityLogs).values({
    userId: order.userId,
    action: "PAYMENT_SUCCESS",
    entity: "order",
    entityId: order.id,
    meta: { code: order.orderCode, amount: order.total },
  });

  return NextResponse.json({ ok: true, delivered: true });
}
