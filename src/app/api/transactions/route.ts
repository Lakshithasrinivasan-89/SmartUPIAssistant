import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth/session";

const typeSchema = z.enum(["credit", "debit"]);
const categorySchema = z.enum(["income", "expense", "refund", "supplier_payment", "unknown"]);

export async function GET(req: Request) {
  const user = await getCurrentUserOrThrow();
  const url = new URL(req.url);

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const category = url.searchParams.get("category");
  const type = url.searchParams.get("type");
  const minAmount = url.searchParams.get("minAmount");
  const maxAmount = url.searchParams.get("maxAmount");
  const q = url.searchParams.get("q");
  const limit = Number(url.searchParams.get("limit") || "50");

  const where: any = { userId: user.id };

  if (from || to) {
    where.transactionTime = {};
    if (from) where.transactionTime.gte = new Date(from + "T00:00:00");
    if (to) where.transactionTime.lte = new Date(to + "T23:59:59");
  }
  if (category) where.category = categorySchema.parse(category);
  if (type) where.transactionType = typeSchema.parse(type);
  if (minAmount) where.amount = { ...(where.amount || {}), gte: Number(minAmount) };
  if (maxAmount) where.amount = { ...(where.amount || {}), lte: Number(maxAmount) };

  if (q) {
    const qq = q.trim();
    where.OR = [
      { messageText: { contains: qq, mode: "insensitive" } },
      { customerName: { contains: qq, mode: "insensitive" } },
      { sourceApp: { contains: qq, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { transactionTime: "desc" },
    take: clamp(limit, 1, 200),
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
      createdAt: true,
    },
  });

  return NextResponse.json({
    transactions: rows.map((r) => ({
      ...r,
      amount: Number(r.amount.toString()),
    })),
  });
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const manualBodySchema = z.object({
  amount: z.number().positive(),
  transactionType: typeSchema,
  category: categorySchema,
  messageText: z.string().optional(),
  customerName: z.string().optional().nullable(),
  sourceApp: z.string().optional().nullable(),
  transactionTime: z.string().optional(), // ISO or yyyy-mm-dd
  inventoryItemId: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = manualBodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const b = parsed.data;
  const transactionTime = b.transactionTime ? new Date(b.transactionTime) : new Date();

  const created = await prisma.transaction.create({
    data: {
      userId: user.id,
      messageText: b.messageText ?? null,
      amount: b.amount,
      transactionType: b.transactionType,
      category: b.category,
      customerName: b.customerName ?? null,
      sourceApp: b.sourceApp ?? null,
      transactionTime,
      inventoryItemId: b.inventoryItemId ?? null,
      quantity: b.quantity ?? null,
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

  return NextResponse.json({ transaction: { ...created, amount: Number(created.amount.toString()) } });
}

