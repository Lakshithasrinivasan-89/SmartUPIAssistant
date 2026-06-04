import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken } from "@/lib/auth/session";
import type { Role } from "@prisma/client";

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80),
  password: z.string().min(6).max(120),
  role: z.enum(["vendor", "user"]).default("vendor"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role as Role,
        language: "en",
      },
      select: { id: true, email: true, name: true, role: true, language: true },
    });

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

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

