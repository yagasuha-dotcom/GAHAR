import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createSession, findUserByEmail } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(6).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const existing = await findUserByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email sudah terdaftar" },
        { status: 400 },
      );
    }
    const hash = await hashPassword(data.password);
    const [u] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: hash,
        role: "CUSTOMER",
        emailVerifiedAt: new Date(),
      })
      .returning();
    await createSession({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    });
    return NextResponse.json({ ok: true, user: { id: u.id, name: u.name } });
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0].message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
