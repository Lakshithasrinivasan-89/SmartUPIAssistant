import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const languageSchema = z.enum(["en", "hi", "kn", "ta", "te"]);

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = languageSchema.safeParse(body?.language);
  if (!parsed.success) return NextResponse.json({ error: "Invalid language" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { language: parsed.data },
    select: { id: true, language: true },
  });

  return NextResponse.json({ language: updated.language });
}

