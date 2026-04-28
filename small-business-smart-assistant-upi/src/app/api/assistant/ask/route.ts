import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { answerAssistantQuery } from "@/lib/assistant/assistant";

const bodySchema = z.object({
  question: z.string().min(1),
  language: z.enum(["en", "hi", "kn", "ta", "te"]).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { question, language } = parsed.data;
  const response = await answerAssistantQuery({
    userId: user.id,
    question,
    language: (language ?? user.language) as any,
  });

  return NextResponse.json({ response });
}

