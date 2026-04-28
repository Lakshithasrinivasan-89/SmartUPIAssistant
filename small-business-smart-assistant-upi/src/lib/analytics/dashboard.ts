import type { Decimal } from "@prisma/client/runtime/library";
import type { AlertType, ExpenseCategory, TransactionCategory } from "@prisma/client";

import type { prisma as PrismaType } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

type DashboardRange = "today" | "weekly" | "monthly";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfMonth(d: Date) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatHourRange(bestStartHour: number, hours: number) {
  const start = bestStartHour % 24;
  const end = (bestStartHour + hours) % 24;
  const fmt = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${period}`;
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

function decToNumber(v: Decimal | null | undefined) {
  if (v === null || v === undefined) return 0;
  // Prisma Decimal has toString
  return Number((v as any).toString());
}

export async function getDashboardData(userId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  // Fetch raw data in broad window for charts/peak calculations.
  const chartStart = new Date(now);
  chartStart.setDate(now.getDate() - 13);
  chartStart.setHours(0, 0, 0, 0);

  const [txChart, txToday, txWeek, txMonth, expensesToday, expensesWeek, expensesMonth] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: chartStart, lte: weekEnd } },
      select: { amount: true, category: true, transactionTime: true, transactionType: true, customerName: true },
      orderBy: { transactionTime: "asc" },
    }),
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: todayStart, lte: todayEnd } },
      select: { amount: true, category: true, transactionType: true, customerName: true, transactionTime: true, messageText: true },
      orderBy: { transactionTime: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: weekStart, lte: weekEnd } },
      select: { amount: true, category: true, transactionType: true, customerName: true, transactionTime: true },
    }),
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: monthStart, lte: monthEnd } },
      select: { amount: true, category: true, transactionType: true, customerName: true, transactionTime: true },
    }),
    prisma.expense.findMany({
      where: { userId, expenseTime: { gte: todayStart, lte: todayEnd } },
      select: { amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, expenseTime: { gte: weekStart, lte: weekEnd } },
      select: { amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, expenseTime: { gte: monthStart, lte: monthEnd } },
      select: { amount: true },
    }),
  ]);

  const sumIncome = (rows: typeof txChart) =>
    rows.reduce((acc, t) => {
      if (t.category === "income" && t.transactionType === "credit") return acc + decToNumber(t.amount as any);
      return acc;
    }, 0);

  const sumRefunds = (rows: typeof txChart) =>
    rows.reduce((acc, t) => {
      if (t.category === "refund") return acc + decToNumber(t.amount as any);
      return acc;
    }, 0);

  const sumRevenue = (rows: typeof txChart) => sumIncome(rows) - sumRefunds(rows);

  const todayRevenue = sumRevenue(txToday);
  const weekRevenue = sumRevenue(txWeek);
  const monthRevenue = sumRevenue(txMonth);

  const totalExpensesWeek = expensesWeek.reduce((acc, e) => acc + decToNumber(e.amount as any), 0);
  const totalExpensesMonth = expensesMonth.reduce((acc, e) => acc + decToNumber(e.amount as any), 0);

  const estimatedProfitWeek = weekRevenue - totalExpensesWeek;
  const estimatedProfitMonth = monthRevenue - totalExpensesMonth;

  const incomeTxWeek = txWeek.filter((t) => t.category === "income" && t.transactionType === "credit");
  const avgTransactionValue =
    incomeTxWeek.length > 0 ? incomeTxWeek.reduce((a, t) => a + decToNumber(t.amount as any), 0) / incomeTxWeek.length : 0;

  // Peak hours: find best 2-hour window by income revenue.
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  for (const t of txChart) {
    if (t.category !== "income" || t.transactionType !== "credit") continue;
    if (!t.transactionTime) continue;
    const h = t.transactionTime.getHours();
    hourBuckets[h] += decToNumber(t.amount as any);
  }
  let bestStart = 0;
  let bestSum = -1;
  for (let start = 0; start < 24; start++) {
    const s = hourBuckets[start] + hourBuckets[(start + 1) % 24];
    if (s > bestSum) {
      bestSum = s;
      bestStart = start;
    }
  }

  // Busiest day of week (Mon..Sun).
  const weekdayBuckets = new Array(7).fill(0);
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const t of txChart) {
    if (t.category !== "income" || t.transactionType !== "credit") continue;
    if (!t.transactionTime) continue;
    const day = t.transactionTime.getDay();
    weekdayBuckets[day] += decToNumber(t.amount as any);
  }
  let busiestDayIdx = 0;
  for (let i = 1; i < 7; i++) {
    if (weekdayBuckets[i] > weekdayBuckets[busiestDayIdx]) busiestDayIdx = i;
  }

  // Sales chart (daily revenue over last 14 days).
  const dayMap = new Map<string, number>();
  for (const t of txChart) {
    if (!t.transactionTime) continue;
    const key = toISODate(t.transactionTime);
    const v = dayMap.get(key) ?? 0;
    // include income and subtract refunds
    if (t.category === "income" && t.transactionType === "credit") dayMap.set(key, v + decToNumber(t.amount as any));
    else if (t.category === "refund") dayMap.set(key, v - decToNumber(t.amount as any));
  }

  const chartDays: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toISODate(d);
    chartDays.push({ date: key, revenue: dayMap.get(key) ?? 0 });
  }

  // Recent transactions (mix of categories).
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId, transactionTime: { gte: chartStart, lte: weekEnd } },
    orderBy: { transactionTime: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      category: true,
      transactionType: true,
      customerName: true,
      sourceApp: true,
      transactionTime: true,
      messageText: true,
      inventoryItemId: true,
      quantity: true,
    },
  });

  // Simple day-over-day drop insight vs yesterday.
  const yStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const yEnd = endOfDay(yStart);
  const [yTx, yyTx] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: yStart, lte: yEnd } },
      select: { amount: true, category: true, transactionType: true },
    }),
    prisma.transaction.findMany({
      where: { userId, transactionTime: { gte: startOfDay(new Date(yStart.getTime() - 86400000)), lte: endOfDay(new Date(yStart.getTime() - 86400000)) } },
      select: { amount: true, category: true, transactionType: true },
    }),
  ]);
  const yRevenue = sumRevenue(yTx as any);
  const yyRevenue = sumRevenue(yyTx as any);
  const dropPct = yyRevenue > 0 ? ((yRevenue - yyRevenue) / yyRevenue) * 100 : 0;
  const isDrop = dropPct < 0;

  return {
    today: { revenue: todayRevenue },
    weekly: { revenue: weekRevenue },
    monthly: { revenue: monthRevenue },
    expenses: {
      week: totalExpensesWeek,
      month: totalExpensesMonth,
      today: expensesToday.reduce((acc, e) => acc + decToNumber(e.amount as any), 0),
    },
    profit: {
      estimatedWeek: estimatedProfitWeek,
      estimatedMonth: estimatedProfitMonth,
    },
    averageTransactionValue: avgTransactionValue,
    peakSalesHours: {
      rangeLabel: formatHourRange(bestStart, 2),
      bestStartHour: bestStart,
    },
    peakInsights: {
      busiestDayOfWeek: weekdayLabels[busiestDayIdx],
    },
    insights: {
      salesDip: isDrop ? `Your sales dropped ${Math.abs(dropPct).toFixed(0)}% compared to yesterday.` : `Your sales are up compared to yesterday.`,
      bestTime: `Your highest sales occur between ${formatHourRange(bestStart, 2)}.`,
    },
    chart: {
      days: chartDays,
    },
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      amount: decToNumber(t.amount as any),
    })),
  };
}

