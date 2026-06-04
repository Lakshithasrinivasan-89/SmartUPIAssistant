import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { parseUpiSmsText } from "@/lib/upi/parser";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  messagesText: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 });
  }

  const parsed = parseUpiSmsText(parsedBody.data.messagesText);

  if (parsed.length === 0) {
    return NextResponse.json({ ok: true, parsed: [], saved: 0 });
  }

  const created = await prisma.transaction.createMany({
    data: parsed.map((p) => ({
      userId: user.id,
      messageText: p.messageText,
      amount: p.amount,
      transactionType: p.transactionType,
      category: p.category,
      customerName: p.customerName,
      sourceApp: p.sourceApp,
      transactionTime: p.transactionTime,
      inventoryItemId: null,
      quantity: null,
    })),
  });

  return NextResponse.json({ ok: true, parsed, saved: created.count });
}

