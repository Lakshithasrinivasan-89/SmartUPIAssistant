import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth/session";

const typeSchema = z.enum(["credit", "debit"]);
const categorySchema = z.enum(["income", "expense", "refund", "supplier_payment", "unknown"]);

const patchSchema = z.object({
  amount: z.number().positive().optional(),
  transactionType: typeSchema.optional(),
  category: categorySchema.optional(),
  messageText: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  sourceApp: z.string().optional().nullable(),
  transactionTime: z.string().optional().nullable(),
  inventoryItemId: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const b = parsed.data;

  const existing = await prisma.transaction.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      ...(b.amount !== undefined ? { amount: b.amount } : {}),
      ...(b.transactionType !== undefined ? { transactionType: b.transactionType } : {}),
      ...(b.category !== undefined ? { category: b.category } : {}),
      ...(b.messageText !== undefined ? { messageText: b.messageText } : {}),
      ...(b.customerName !== undefined ? { customerName: b.customerName } : {}),
      ...(b.sourceApp !== undefined ? { sourceApp: b.sourceApp } : {}),
      ...(b.transactionTime !== undefined
        ? { transactionTime: b.transactionTime ? new Date(b.transactionTime) : null }
        : {}),
      ...(b.inventoryItemId !== undefined ? { inventoryItemId: b.inventoryItemId } : {}),
      ...(b.quantity !== undefined ? { quantity: b.quantity } : {}),
    },
    select: {
      id: true,
      amount: true,
      transactionType: true,
      category: true,
      customerName: true,
      sourceApp: true,
      transactionTime: true,
      messageText: true,
      inventoryItemId: true,
      quantity: true,
    },
  });

  return NextResponse.json({ transaction: { ...updated, amount: Number(updated.amount.toString()) } });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserOrThrow();
  const existing = await prisma.transaction.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

