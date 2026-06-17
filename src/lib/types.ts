export type Role = "vendor" | "user";
export type TransactionType = "credit" | "debit";
export type TransactionCategory = "income" | "expense" | "refund" | "supplier_payment" | "unknown";
export type ExpenseCategory = "rent" | "electricity" | "stock_purchase" | "transport" | "miscellaneous";
export type AlertType = "low_stock" | "unusual_sales_dip" | "peak_hour" | "top_selling_restock";
export type SalesPeriod = "daily" | "weekly" | "monthly";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  language: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  messageText?: string | null;
  amount: number;
  transactionType: TransactionType;
  category: TransactionCategory;
  customerName?: string | null;
  sourceApp?: string | null;
  transactionTime?: Date | null;
  inventoryItemId?: string | null;
  quantity?: number | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
  expenseTime?: Date | null;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  userId: string;
  productName: string;
  category: string;
  stockQuantity: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantQuery {
  id: string;
  userId: string;
  question: string;
  response: string;
  language: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  message: string;
  isResolved: boolean;
  createdAt: Date;
}

export interface SalesSummary {
  id: string;
  userId: string;
  period: SalesPeriod;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  estimatedProfit: number;
  createdAt: Date;
}
