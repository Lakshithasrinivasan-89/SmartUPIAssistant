import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signSessionToken, verifyPassword } from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(120),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, language: true, passwordHash: true },
    });

    if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const token = signSessionToken({
      sub: user.id,
      role: user.role,
      language: user.language,
      email: user.email,
    });

    const cookieStore = await cookies();
    const cookieName = process.env.COOKIE_NAME || "sbsa_session";
    const maxAgeSeconds = Number(process.env.JWT_EXPIRES_SECONDS || "86400");
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAgeSeconds,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, language: user.language },
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

