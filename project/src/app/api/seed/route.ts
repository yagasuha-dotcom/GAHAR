import { NextResponse } from "next/server";
import { seedIfEmpty } from "@/lib/seed";

export async function GET() {
  try {
    const r = await seedIfEmpty();
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 },
    );
  }
}
