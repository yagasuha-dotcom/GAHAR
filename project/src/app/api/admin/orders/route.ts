import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json({ items });
}
