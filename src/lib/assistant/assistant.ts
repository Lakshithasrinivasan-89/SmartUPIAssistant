import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/analytics/dashboard";
import { getInventorySuggestions } from "@/lib/inventory/suggestions";
import type { SupportedLanguage } from "@/lib/i18n/translations";

function containsAny(haystack: string, needles: string[]) {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

export async function answerAssistantQuery(args: {
  userId: string;
  question: string;
  language: SupportedLanguage;
}) {
  const { userId, question, language } = args;
  const q = question.trim();
  if (!q) return "Please ask a question.";

  const dashboard = await getDashboardData(userId);
  const inventorySuggestions = await getInventorySuggestions(userId);
  const lowStock = inventorySuggestions.filter((s) => s.isLowStock).slice(0, 3);
  const fastMoving = inventorySuggestions.filter((s) => s.movement === "fast").slice(0, 3);

  let response = "";

  if (
    containsAny(q, ["earn today", "earned today", "how much did i earn today", "income today", "sales today", "today"])
  ) {
    const amt = dashboard.today.revenue;
    response = `Today’s estimated sales (after refunds) are about INR ${amt.toFixed(0)}. Keep an eye on the next 2-hour window around ${dashboard.peakSalesHours.rangeLabel}.`;
  } else if (containsAny(q, ["peak", "peak hour", "peak sales", "busiest time", "best time"])) {
    response = `Your highest sales occur between ${dashboard.peakSalesHours.rangeLabel}. Try pushing offers and restocking just before that window. Also, your busiest day is ${dashboard.peakInsights.busiestDayOfWeek}.`;
  } else if (containsAny(q, ["profit this week", "profit week", "how much profit", "estimated profit"])) {
    const p = dashboard.profit.estimatedWeek;
    response = `Your estimated profit for this week is about INR ${p.toFixed(0)} (income minus expenses). If it feels tight, start with the biggest expense category you entered.`;
  } else if (containsAny(q, ["restock", "reorder", "low stock", "which items should i restock", "inventory"])) {
    if (lowStock.length === 0) {
      response = `Your inventory looks healthy right now. No items are at low stock based on recent sales.`;
    } else {
      response =
        `You should restock these items soon: ` +
        lowStock.map((s) => `${s.productName} (stock ${s.stockQuantity})`).join(", ") +
        `. Fast-movers right now: ${fastMoving.map((s) => s.productName).join(", ")}.`;
    }
  } else if (containsAny(q, ["average transaction", "avg transaction", "average sale", "transaction value"])) {
    response = `Your average transaction value this week is about INR ${dashboard.averageTransactionValue.toFixed(0)}. If you can slightly increase basket size, profit will improve quickly.`;
  } else {
    response =
      `I can help with income, expenses, peak sales time, profit, and restocking suggestions. Try asking: ` +
      `“How much did I earn today?” or “Which items should I restock?”`;
  }

  await prisma.assistantQuery.create({
    data: {
      userId,
      question: q,
      response,
      language,
    },
  });

  return response;
}

