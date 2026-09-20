import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB per image

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const dataUrl: string | undefined = body?.dataUrl;
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ ok: false, error: "File tidak valid" }, { status: 400 });
    }
    const base64 = dataUrl.split(",")[1] || "";
    const sizeBytes = Math.ceil((base64.length * 3) / 4);
    if (sizeBytes > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Gambar terlalu besar (maks 4MB)" },
        { status: 400 },
      );
    }
    // Stored inline as a data URL — no external storage bucket required.
    return NextResponse.json({ ok: true, url: dataUrl });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
