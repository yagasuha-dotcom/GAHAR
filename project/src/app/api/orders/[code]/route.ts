import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

  const [items, pays] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(payments).where(eq(payments.orderId, order.id)),
  ]);

  return NextResponse.json({ order, items, payments: pays });
}
