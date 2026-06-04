import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth/session";

const bodySchema = z.object({
  productName: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  stockQuantity: z.number().int(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
});

export async function GET() {
  const user = await getCurrentUserOrThrow();
  const rows = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    orderBy: { stockQuantity: "asc" },
    select: {
      id: true,
      productName: true,
      category: true,
      stockQuantity: true,
      costPrice: true,
      sellingPrice: true,
      reorderLevel: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      ...r,
      costPrice: Number(r.costPrice.toString()),
      sellingPrice: Number(r.sellingPrice.toString()),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const b = parsed.data;
  const created = await prisma.inventoryItem.create({
    data: { userId: user.id, ...b },
  });

  return NextResponse.json({
    item: {
      ...created,
      costPrice: Number(created.costPrice.toString()),
      sellingPrice: Number(created.sellingPrice.toString()),
    },
  });
}

