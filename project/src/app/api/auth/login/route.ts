import { NextRequest, NextResponse } from "next/server";
import { createSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, remember } = schema.parse(body);
    const u = await findUserByEmail(email);
    if (!u || !u.passwordHash) {
      return NextResponse.json(
        { ok: false, error: "Email atau password salah" },
        { status: 401 },
      );
    }
    if (u.status !== "ACTIVE") {
      return NextResponse.json(
        { ok: false, error: `Akun ${u.status.toLowerCase()}` },
        { status: 403 },
      );
    }
    const ok = await verifyPassword(password, u.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Email atau password salah" },
        { status: 401 },
      );
    }
    await createSession(
      { id: u.id, email: u.email, name: u.name, role: u.role },
      !!remember,
    );
    return NextResponse.json({
      ok: true,
      user: { id: u.id, name: u.name, role: u.role },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }
}
