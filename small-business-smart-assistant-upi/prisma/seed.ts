import { PrismaClient, Role, TransactionCategory, TransactionType, ExpenseCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function withTime(baseDate: Date, hour: number, minute: number) {
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Reset for demo repeatability.
  await prisma.alert.deleteMany();
  await prisma.assistantQuery.deleteMany();
  await prisma.salesSummary.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo@1234", 10);

  const vendor = await prisma.user.create({
    data: {
      email: "demo@upiplus.dev",
      name: "Lakshmi Kirana",
      passwordHash,
      role: Role.vendor,
      language: "en",
    },
  });

  const tea = await prisma.inventoryItem.create({
    data: {
      userId: vendor.id,
      productName: "Tea (250g)",
      category: "Beverages",
      stockQuantity: 18,
      costPrice: 70,
      sellingPrice: 95,
      reorderLevel: 10,
    },
  });

  const milk = await prisma.inventoryItem.create({
    data: {
      userId: vendor.id,
      productName: "Milk (1L)",
      category: "Beverages",
      stockQuantity: 24,
      costPrice: 48,
      sellingPrice: 60,
      reorderLevel: 12,
    },
  });

  const sugar = await prisma.inventoryItem.create({
    data: {
      userId: vendor.id,
      productName: "Sugar (1kg)",
      category: "Staples",
      stockQuantity: 9,
      costPrice: 38,
      sellingPrice: 55,
      reorderLevel: 12,
    },
  });

  const biscuits = await prisma.inventoryItem.create({
    data: {
      userId: vendor.id,
      productName: "Biscuits (200g)",
      category: "Snacks",
      stockQuantity: 14,
      costPrice: 28,
      sellingPrice: 45,
      reorderLevel: 10,
    },
  });

  const randomIncomeTimes = [
    [18, 5],
    [18, 30],
    [19, 10],
    [20, 0],
    [21, 15],
  ];

  // Create expenses.
  const expenseEntries: Array<{
    category: ExpenseCategory;
    amount: number;
    note: string;
    days: number;
    hour: number;
    minute: number;
  }> = [
    { category: ExpenseCategory.rent, amount: 2500, note: "Shop rent", days: 4, hour: 10, minute: 20 },
    { category: ExpenseCategory.electricity, amount: 980, note: "Electricity bill", days: 7, hour: 12, minute: 10 },
    { category: ExpenseCategory.transport, amount: 450, note: "Auto/transport", days: 2, hour: 17, minute: 45 },
    { category: ExpenseCategory.miscellaneous, amount: 320, note: "Repairs & small items", days: 1, hour: 9, minute: 30 },
    { category: ExpenseCategory.stock_purchase, amount: 1750, note: "Stock purchase (tea bags)", days: 6, hour: 16, minute: 5 },
  ];

  for (const e of expenseEntries) {
    await prisma.expense.create({
      data: {
        userId: vendor.id,
        category: e.category,
        amount: e.amount,
        note: e.note,
        expenseTime: withTime(daysAgo(e.days), e.hour, e.minute),
      },
    });
  }

  // Create transactions with message text for the parser feature demo.
  const transactions: Array<{
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    days: number;
    hour: number;
    minute: number;
    customerName?: string;
    sourceApp?: string;
    inventory?: typeof tea;
    quantity?: number;
    messageText: string;
  }> = [];

  // Income transactions (more in evening).
  for (let day = 0; day <= 13; day++) {
    const base = daysAgo(day);
    const count = day === 0 ? 10 : 6 + (day % 3);

    for (let i = 0; i < count; i++) {
      const [h, m] = randomIncomeTimes[(i + day) % randomIncomeTimes.length];
      const amount = 220 + ((i * 37 + day * 19) % 1350);
      const customer = ["Ravi", "Suresh", "Meena", "Karthik", "Anita"][i % 5];

      const itemPick = [tea, milk, biscuits, tea, sugar][(i + day) % 5];
      const quantity = itemPick.id === sugar.id ? 2 : 1; // a bit more sugar selling when in range

      transactions.push({
        type: TransactionType.credit,
        category: TransactionCategory.income,
        amount,
        days: day,
        hour: h,
        minute: m,
        customerName: customer,
        sourceApp: ["PhonePe", "GPay", "BHIM UPI"][i % 3],
        inventory: itemPick,
        quantity,
        messageText: `UPI Success - Credited INR ${amount} to your account from ${customer} via ${["PhonePe", "GPay", "BHIM UPI"][i % 3]}. Ref No: UPI${10000 + i + day * 10} on ${base.toLocaleDateString("en-GB")}`,
      });
    }

    // Add a debit expense / stock purchase every couple of days.
    if (day % 3 === 1) {
      const debitAmount = 600 + (day * 120) % 1400;
      transactions.push({
        type: TransactionType.debit,
        category: TransactionCategory.expense,
        amount: debitAmount,
        days: day,
        hour: 11 + (day % 6),
        minute: 20,
        customerName: "Bharat Traders",
        sourceApp: "GPay",
        messageText: `UPI Debit of INR ${debitAmount} to Bharat Traders. Your UPI ID: xxxx@upi. on ${base.toLocaleDateString("en-GB")}`,
      });
    }
    if (day % 5 === 2) {
      const refundAmount = 180 + (day * 35) % 260;
      transactions.push({
        type: TransactionType.credit,
        category: TransactionCategory.refund,
        amount: refundAmount,
        days: day,
        hour: 14,
        minute: 10,
        customerName: "Customer Refund",
        sourceApp: "PhonePe",
        messageText: `UPI Refund credited INR ${refundAmount} from Bank of India. Reversed on ${base.toLocaleDateString("en-GB")}`,
      });
    }
  }

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        userId: vendor.id,
        messageText: t.messageText,
        amount: t.amount,
        transactionType: t.type,
        category: t.category,
        customerName: t.customerName ?? null,
        sourceApp: t.sourceApp ?? null,
        transactionTime: withTime(daysAgo(t.days), t.hour, t.minute),
        inventoryItemId: t.inventory ? t.inventory.id : null,
        quantity: t.quantity ?? null,
      },
    });
  }

  // Seed a few assistant queries for nicer demo onboarding.
  await prisma.assistantQuery.create({
    data: {
      userId: vendor.id,
      question: "How much did I earn today?",
      response: "You earned a good amount today. Check your Dashboard for the exact total sales and peak hours.",
      language: "en",
    },
  });

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

