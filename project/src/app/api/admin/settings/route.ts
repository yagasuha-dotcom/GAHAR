import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

const DEFAULT_KEY = "store";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [row] = await db.select().from(settings).where(eq(settings.key, DEFAULT_KEY));
  return NextResponse.json({
    settings: row?.value ?? {
      storeName: "ClintStore",
      whatsapp: "",
      qrisImageUrl: "",
      bankAccounts: [],
      description: "",
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const [existing] = await db.select().from(settings).where(eq(settings.key, DEFAULT_KEY));
  if (existing) {
    await db
      .update(settings)
      .set({ value: body, updatedAt: new Date() })
      .where(eq(settings.key, DEFAULT_KEY));
  } else {
    await db.insert(settings).values({ key: DEFAULT_KEY, value: body });
  }
  return NextResponse.json({ ok: true });
}
