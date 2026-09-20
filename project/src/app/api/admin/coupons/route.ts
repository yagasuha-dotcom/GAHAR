import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(3).max(60),
  type: z.enum(["PERCENT", "NOMINAL"]),
  value: z.number().int().positive(),
  minPurchase: z.number().int().min(0).default(0),
  maxUse: z.number().int().min(0).default(0),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
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
    const [c] = await db
      .insert(coupons)
      .values({
        ...d,
        code: d.code.toUpperCase(),
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        endsAt: d.endsAt ? new Date(d.endsAt) : null,
      })
      .returning();
    return NextResponse.json({ ok: true, coupon: c });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
