import { prisma } from "@/lib/prisma";

type InventorySuggestion = {
  itemId: string;
  productName: string;
  category: string;
  stockQuantity: number;
  reorderLevel: number;
  avgDailySold: number;
  projectedDaysLeft: number | null;
  isLowStock: boolean;
  recommendation: string;
  movement: "fast" | "slow" | "medium";
  soldQtyLast14d: number;
};

export async function getInventorySuggestions(userId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { userId },
    select: {
      id: true,
      productName: true,
      category: true,
      stockQuantity: true,
      reorderLevel: true,
      sellingPrice: true,
    },
    orderBy: { stockQuantity: "asc" },
  });

  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const tx = await prisma.transaction.findMany({
    where: {
      userId,
      inventoryItemId: { not: null },
      transactionTime: { gte: since, lte: now },
      category: "income",
      transactionType: "credit",
    },
    select: {
      inventoryItemId: true,
      quantity: true,
    },
  });

  const soldMap = new Map<string, number>();
  for (const t of tx) {
    const itemId = t.inventoryItemId;
    if (!itemId) continue;
    const qty = t.quantity ?? 1;
    soldMap.set(itemId, (soldMap.get(itemId) ?? 0) + qty);
  }

  const suggestionsBase: Omit<InventorySuggestion, "movement">[] = items.map((it) => {
    const soldQtyLast14d = soldMap.get(it.id) ?? 0;
    const avgDailySold = soldQtyLast14d / 14;
    const projectedDaysLeft = avgDailySold > 0 ? it.stockQuantity / avgDailySold : null;
    const isLowStock = it.stockQuantity <= it.reorderLevel || (projectedDaysLeft !== null && projectedDaysLeft <= 7);
    const recommendation = isLowStock
      ? `Reorder soon. Based on recent sales, you may have enough for ${projectedDaysLeft !== null ? `${projectedDaysLeft.toFixed(1)} days` : "a short time"}.`
      : "Stock looks healthy for the next week.";
    return {
      itemId: it.id,
      productName: it.productName,
      category: it.category,
      stockQuantity: it.stockQuantity,
      reorderLevel: it.reorderLevel,
      avgDailySold,
      projectedDaysLeft,
      isLowStock,
      recommendation,
      soldQtyLast14d,
    };
  });

  // Movement based on sold quantity ranking.
  const sorted = [...suggestionsBase].sort((a, b) => b.soldQtyLast14d - a.soldQtyLast14d);
  const topCount = Math.max(1, Math.floor(sorted.length * 0.25));
  const lowCount = Math.max(1, Math.floor(sorted.length * 0.25));
  const topIds = new Set(sorted.slice(0, topCount).map((s) => s.itemId));
  const bottomIds = new Set(sorted.slice(sorted.length - lowCount).map((s) => s.itemId));

  return suggestionsBase.map((s) => {
    const movement: InventorySuggestion["movement"] = topIds.has(s.itemId)
      ? "fast"
      : bottomIds.has(s.itemId)
        ? "slow"
        : "medium";
    return { ...s, movement };
  });
}

