import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth/session";

const expenseCategory = z.enum(["rent", "electricity", "stock_purchase", "transport", "miscellaneous"]);

export async function GET(req: Request) {
  const user = await getCurrentUserOrThrow();
  const url = new URL(req.url);

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const category = url.searchParams.get("category");
  const limit = Number(url.searchParams.get("limit") || "80");

  const where: any = { userId: user.id };
  if (from || to) {
    where.expenseTime = {};
    if (from) where.expenseTime.gte = new Date(from + "T00:00:00");
    if (to) where.expenseTime.lte = new Date(to + "T23:59:59");
  }
  if (category) where.category = expenseCategory.parse(category);

  const rows = await prisma.expense.findMany({
    where,
    orderBy: { expenseTime: "desc" },
    take: clamp(limit, 1, 200),
    select: {
      id: true,
      amount: true,
      category: true,
      note: true,
      expenseTime: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    expenses: rows.map((r) => ({ ...r, amount: Number(r.amount.toString()) })),
  });
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const bodySchema = z.object({
  category: expenseCategory,
  amount: z.number().positive(),
  note: z.string().optional().nullable(),
  expenseTime: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const b = parsed.data;
  const expenseTime = b.expenseTime ? new Date(b.expenseTime) : new Date();

  const created = await prisma.expense.create({
    data: {
      userId: user.id,
      category: b.category,
      amount: b.amount,
      note: b.note ?? null,
      expenseTime,
    },
  });

  return NextResponse.json({ expense: { ...created, amount: Number(created.amount.toString()) } });
}

