import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      totalSpent: sql<string>`COALESCE((SELECT SUM(total)::text FROM orders WHERE user_id = users.id AND status IN ('PAID','DELIVERED','COMPLETED')), '0')`,
      orderCount: sql<string>`COALESCE((SELECT COUNT(*)::text FROM orders WHERE user_id = users.id), '0')`,
    })
    .from(users)
    .where(eq(users.role, "CUSTOMER"))
    .orderBy(desc(users.createdAt));
  return NextResponse.json({ items: rows });
}
