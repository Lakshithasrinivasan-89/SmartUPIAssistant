import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const cookieName = process.env.COOKIE_NAME || "sbsa_session";
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}

