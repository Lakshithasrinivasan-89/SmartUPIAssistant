import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserOrThrow } from "@/lib/auth/session";

const patchSchema = z.object({
  productName: z.string().min(1).max(120).optional(),
  category: z.string().min(1).max(80).optional(),
  stockQuantity: z.number().int().optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  reorderLevel: z.number().int().nonnegative().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserOrThrow();
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.inventoryItem.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: parsed.data,
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
    item: {
      ...updated,
      costPrice: Number(updated.costPrice.toString()),
      sellingPrice: Number(updated.sellingPrice.toString()),
    },
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUserOrThrow();
  const existing = await prisma.inventoryItem.findFirst({ where: { id: params.id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.inventoryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

