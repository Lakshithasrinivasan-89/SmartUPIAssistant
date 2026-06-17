import type {
  User,
  Transaction,
  Expense,
  InventoryItem,
  AssistantQuery,
  Alert,
  SalesSummary,
} from "./types";

const isBrowser = typeof window !== "undefined";

// In-memory fallback for SSR build-time pre-rendering
const inMemoryDb: Record<string, any[]> = {
  users: [],
  transactions: [],
  expenses: [],
  inventoryItems: [],
  assistantQueries: [],
  alerts: [],
  salesSummaries: [],
};

function parseDates(item: any): any {
  if (!item) return item;
  const dateFields = ["transactionTime", "expenseTime", "createdAt", "updatedAt", "startDate", "endDate"];
  const copy = { ...item };
  for (const field of dateFields) {
    if (copy[field] !== undefined && copy[field] !== null) {
      copy[field] = new Date(copy[field]);
    }
  }
  return copy;
}

function loadTable<T>(name: string): T[] {
  if (!isBrowser) return ((inMemoryDb[name] || []).map(parseDates)) as T[];
  const val = localStorage.getItem(`sbsa_db_${name}`);
  if (!val) return [];
  const parsed = JSON.parse(val);
  return parsed.map(parseDates) as T[];
}

function saveTable<T>(name: string, data: T[]) {
  if (!isBrowser) {
    inMemoryDb[name] = data;
    return;
  }
  localStorage.setItem(`sbsa_db_${name}`, JSON.stringify(data));
}

// Seeding logic
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

export function seedMockDatabase() {
  if (!isBrowser) return;
  if (localStorage.getItem("sbsa_db_seeded") === "true") return;

  const vendor: User = {
    id: "demo-user-id",
    email: "demo@upiplus.dev",
    name: "Lakshmi Kirana",
    passwordHash: "demo-hash",
    role: "vendor",
    language: "en",
    createdAt: new Date(),
  };

  const tea: InventoryItem = {
    id: "item-tea-id",
    userId: vendor.id,
    productName: "Tea (250g)",
    category: "Beverages",
    stockQuantity: 18,
    costPrice: 70,
    sellingPrice: 95,
    reorderLevel: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const milk: InventoryItem = {
    id: "item-milk-id",
    userId: vendor.id,
    productName: "Milk (1L)",
    category: "Beverages",
    stockQuantity: 24,
    costPrice: 48,
    sellingPrice: 60,
    reorderLevel: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sugar: InventoryItem = {
    id: "item-sugar-id",
    userId: vendor.id,
    productName: "Sugar (1kg)",
    category: "Staples",
    stockQuantity: 9,
    costPrice: 38,
    sellingPrice: 55,
    reorderLevel: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const biscuits: InventoryItem = {
    id: "item-biscuits-id",
    userId: vendor.id,
    productName: "Biscuits (200g)",
    category: "Snacks",
    stockQuantity: 14,
    costPrice: 28,
    sellingPrice: 45,
    reorderLevel: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Seed users
  saveTable("users", [vendor]);

  // Seed inventoryItems
  saveTable("inventoryItems", [tea, milk, sugar, biscuits]);

  // Seed expenses
  const expenseEntries = [
    { category: "rent", amount: 2500, note: "Shop rent", days: 4, hour: 10, minute: 20 },
    { category: "electricity", amount: 980, note: "Electricity bill", days: 7, hour: 12, minute: 10 },
    { category: "transport", amount: 450, note: "Auto/transport", days: 2, hour: 17, minute: 45 },
    { category: "miscellaneous", amount: 320, note: "Repairs & small items", days: 1, hour: 9, minute: 30 },
    { category: "stock_purchase", amount: 1750, note: "Stock purchase (tea bags)", days: 6, hour: 16, minute: 5 },
  ];

  const expenses: Expense[] = expenseEntries.map((e, index) => ({
    id: `expense-${index}`,
    userId: vendor.id,
    category: e.category as any,
    amount: e.amount,
    note: e.note,
    expenseTime: withTime(daysAgo(e.days), e.hour, e.minute),
    createdAt: new Date(),
  }));
  saveTable("expenses", expenses);

  // Seed transactions
  const randomIncomeTimes = [
    [18, 5],
    [18, 30],
    [19, 10],
    [20, 0],
    [21, 15],
  ];

  const transactionsList: Transaction[] = [];
  let txIndex = 0;

  for (let day = 0; day <= 13; day++) {
    const base = daysAgo(day);
    const count = day === 0 ? 10 : 6 + (day % 3);

    for (let i = 0; i < count; i++) {
      const [h, m] = randomIncomeTimes[(i + day) % randomIncomeTimes.length];
      const amount = 220 + ((i * 37 + day * 19) % 1350);
      const customer = ["Ravi", "Suresh", "Meena", "Karthik", "Anita"][i % 5];
      const itemPick = [tea, milk, biscuits, tea, sugar][(i + day) % 5];
      const quantity = itemPick.id === sugar.id ? 2 : 1;

      transactionsList.push({
        id: `tx-${txIndex++}`,
        userId: vendor.id,
        messageText: `UPI Success - Credited INR ${amount} to your account from ${customer} via ${["PhonePe", "GPay", "BHIM UPI"][i % 3]}. Ref No: UPI${10000 + i + day * 10} on ${base.toLocaleDateString("en-GB")}`,
        amount,
        transactionType: "credit",
        category: "income",
        customerName: customer,
        sourceApp: ["PhonePe", "GPay", "BHIM UPI"][i % 3],
        transactionTime: withTime(daysAgo(day), h, m),
        inventoryItemId: itemPick.id,
        quantity,
        createdAt: new Date(),
      });
    }

    if (day % 3 === 1) {
      const debitAmount = 600 + (day * 120) % 1400;
      transactionsList.push({
        id: `tx-${txIndex++}`,
        userId: vendor.id,
        messageText: `UPI Debit of INR ${debitAmount} to Bharat Traders. Your UPI ID: xxxx@upi. on ${base.toLocaleDateString("en-GB")}`,
        amount: debitAmount,
        transactionType: "debit",
        category: "expense",
        customerName: "Bharat Traders",
        sourceApp: "GPay",
        transactionTime: withTime(daysAgo(day), 11 + (day % 6), 20),
        inventoryItemId: null,
        quantity: null,
        createdAt: new Date(),
      });
    }

    if (day % 5 === 2) {
      const refundAmount = 180 + (day * 35) % 260;
      transactionsList.push({
        id: `tx-${txIndex++}`,
        userId: vendor.id,
        messageText: `UPI Refund credited INR ${refundAmount} from Bank of India. Reversed on ${base.toLocaleDateString("en-GB")}`,
        amount: refundAmount,
        transactionType: "credit",
        category: "refund",
        customerName: "Customer Refund",
        sourceApp: "PhonePe",
        transactionTime: withTime(daysAgo(day), 14, 10),
        inventoryItemId: null,
        quantity: null,
        createdAt: new Date(),
      });
    }
  }

  saveTable("transactions", transactionsList);

  // Seed a few assistant queries
  const queries: AssistantQuery[] = [
    {
      id: "q-1",
      userId: vendor.id,
      question: "How much did I earn today?",
      response: "You earned a good amount today. Check your Dashboard for the exact total sales and peak hours.",
      language: "en",
      createdAt: new Date(),
    },
  ];
  saveTable("assistantQueries", queries);

  localStorage.setItem("sbsa_db_seeded", "true");
}

// Run seed immediately if in browser
if (isBrowser) {
  seedMockDatabase();
}

function matchFilter(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const filterVal = where[key];
    const itemVal = item[key];

    if (key === "OR") {
      const match = filterVal.some((subWhere: any) => matchFilter(item, subWhere));
      if (!match) return false;
      continue;
    }

    if (filterVal && typeof filterVal === "object" && !(filterVal instanceof Date)) {
      for (const op of Object.keys(filterVal)) {
        const opVal = filterVal[op];
        if (op === "gte") {
          const itemTime = itemVal ? new Date(itemVal).getTime() : 0;
          const filterTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (itemTime < filterTime) return false;
        } else if (op === "lte") {
          const itemTime = itemVal ? new Date(itemVal).getTime() : 0;
          const filterTime = opVal instanceof Date ? opVal.getTime() : new Date(opVal).getTime();
          if (itemTime > filterTime) return false;
        } else if (op === "contains") {
          const containsVal = String(opVal).toLowerCase();
          const targetVal = String(itemVal || "").toLowerCase();
          if (!targetVal.includes(containsVal)) return false;
        } else if (op === "not") {
          if (opVal === null) {
            if (itemVal !== null && itemVal !== undefined) return false;
          } else if (itemVal === opVal) {
            return false;
          }
        }
      }
    } else {
      if (itemVal instanceof Date && filterVal instanceof Date) {
        if (itemVal.getTime() !== filterVal.getTime()) return false;
      } else if (itemVal !== filterVal) {
        return false;
      }
    }
  }
  return true;
}

function sortItems(items: any[], orderBy: any) {
  if (!orderBy) return items;
  const key = Object.keys(orderBy)[0];
  const direction = orderBy[key];
  return [...items].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

function makeModelMock<T>(tableName: string) {
  return {
    findMany: async (options?: { where?: any; orderBy?: any; take?: number; select?: any }) => {
      const items = loadTable<T>(tableName);
      let filtered = items.filter((item) => matchFilter(item, options?.where));
      if (options?.orderBy) {
        filtered = sortItems(filtered, options.orderBy);
      }
      if (options?.take !== undefined) {
        filtered = filtered.slice(0, options.take);
      }
      return filtered;
    },
    findFirst: async (options?: { where?: any; select?: any }) => {
      const items = loadTable<T>(tableName);
      const filtered = items.filter((item) => matchFilter(item, options?.where));
      return filtered.length > 0 ? filtered[0] : null;
    },
    findUnique: async (options?: { where?: any; select?: any }) => {
      const items = loadTable<T>(tableName);
      const filtered = items.filter((item) => matchFilter(item, options?.where));
      return filtered.length > 0 ? filtered[0] : null;
    },
    create: async (args: { data: any }) => {
      const items = loadTable<T>(tableName);
      const newItem = {
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args.data,
      };
      items.push(newItem);
      saveTable(tableName, items);
      return parseDates(newItem);
    },
    createMany: async (args: { data: any[] }) => {
      const items = loadTable<T>(tableName);
      const added: any[] = [];
      for (const d of args.data) {
        const newItem = {
          id: Math.random().toString(36).substring(2, 11),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...d,
        };
        items.push(newItem);
        added.push(newItem);
      }
      saveTable(tableName, items);
      return { count: added.length };
    },
    update: async (args: { where: any; data: any }) => {
      const items = loadTable<T>(tableName);
      let foundIndex = -1;
      for (let i = 0; i < items.length; i++) {
        if (matchFilter(items[i], args.where)) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex === -1) throw new Error("Item to update not found");
      const updatedItem = {
        ...items[foundIndex],
        ...args.data,
        updatedAt: new Date(),
      };
      items[foundIndex] = updatedItem;
      saveTable(tableName, items);
      return parseDates(updatedItem);
    },
    delete: async (args: { where: any }) => {
      const items = loadTable<T>(tableName);
      let foundIndex = -1;
      for (let i = 0; i < items.length; i++) {
        if (matchFilter(items[i], args.where)) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex === -1) throw new Error("Item to delete not found");
      const deleted = items.splice(foundIndex, 1)[0];
      saveTable(tableName, items);
      return parseDates(deleted);
    },
    deleteMany: async () => {
      saveTable(tableName, []);
      return { count: 0 };
    },
  };
}

export const prisma = {
  user: makeModelMock<User>("users"),
  transaction: makeModelMock<Transaction>("transactions"),
  expense: makeModelMock<Expense>("expenses"),
  inventoryItem: makeModelMock<InventoryItem>("inventoryItems"),
  assistantQuery: makeModelMock<AssistantQuery>("assistantQueries"),
  alert: makeModelMock<Alert>("alerts"),
  salesSummary: makeModelMock<SalesSummary>("salesSummaries"),
  $disconnect: async () => {},
};
