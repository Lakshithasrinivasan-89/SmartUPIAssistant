import type { Prisma, TransactionCategory, TransactionType } from "@prisma/client";

export type ParsedUpiTransaction = {
  amount: number;
  customerName: string | null;
  transactionTime: Date | null;
  transactionType: TransactionType;
  category: TransactionCategory;
  sourceApp: string | null;
  messageText: string;
};

function normalizeSpace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function extractAmount(message: string): number | null {
  // Common formats:
  // - INR 1,234.50
  // - INR1234
  // - ₹ 1234.00
  const rupeeLike =
    /(?:INR|Rs\.?|₹)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i;
  const m = message.match(rupeeLike);
  if (!m) return null;
  const raw = m[1].replace(/,/g, "");
  const val = Number(raw);
  if (!Number.isFinite(val)) return null;
  return Math.round(val * 100) / 100;
}

function extractSourceApp(message: string): string | null {
  const m = message.match(/\bvia\s+([A-Za-z0-9 ]+?)(?:\.|,|\s+Ref\b|$)/i);
  if (m?.[1]) return normalizeSpace(m[1]);
  const known = ["PhonePe", "GPay", "BHIM UPI", "Paytm", "Google Pay", "Phone Pay"];
  const found = known.find((k) => message.toLowerCase().includes(k.toLowerCase()));
  return found ?? null;
}

function extractCustomerName(message: string): string | null {
  // credit: "... from <Name> via ..."
  const from = message.match(/\bfrom\s+([A-Za-z&. ]+?)(?=\s+via\b|\s*\.\s*Your\b|\s+Ref\b|$)/i);
  if (from?.[1]) return normalizeSpace(from[1]);
  // debit: "... to <Name> ..."
  const to = message.match(/\bto\s+([A-Za-z&. ]+?)(?=\s*\.\s*Your\b|\.|\s+Your\b|\s+UPI\b|$)/i);
  if (to?.[1]) return normalizeSpace(to[1]);
  // fallback: "Paid to <Name>"
  const paidTo = message.match(/\bPaid\s+to\s+([A-Za-z&. ]+?)(?=\b\.|$)/i);
  if (paidTo?.[1]) return normalizeSpace(paidTo[1]);
  return null;
}

function parseTransactionTime(message: string): Date | null {
  const now = new Date();

  // Date formats:
  // - on 21/03/2026
  // - on 21-03-2026
  // - on 12-MAR 6:45 PM
  let date: Date | null = null;
  const date1 = message.match(/\bon\s+(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/i);
  if (date1) {
    const day = Number(date1[1]);
    const month = Number(date1[2]);
    let year = Number(date1[3]);
    if (year < 100) year += 2000;
    date = new Date(year, month - 1, day, 12, 0, 0, 0);
  } else {
    // on 12-MAR or 12 MAR
    const monthMap: Record<string, number> = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11,
    };
    const m2 = message.match(/\bon\s+(\d{1,2})[-\s]?([A-Z]{3})\b/i);
    if (m2) {
      const day = Number(m2[1]);
      const mon = monthMap[m2[2].toUpperCase()];
      if (Number.isFinite(mon)) {
        // If year not present, assume current year; if that creates a future date far ahead, assume previous year.
        const yearGuess = now.getFullYear();
        let d = new Date(yearGuess, mon, day, 12, 0, 0, 0);
        if (d.getTime() - now.getTime() > 1000 * 60 * 60 * 24 * 180) {
          d = new Date(yearGuess - 1, mon, day, 12, 0, 0, 0);
        }
        date = d;
      }
    }
  }

  const timeMatch = message.match(/\b(\d{1,2}):(\d{2})\s*([AP]M)\b/i);
  if (!date) {
    // If time only exists, can't reliably set a datetime.
    return null;
  }
  if (!timeMatch) return date;

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  date.setHours(hour, minute, 0, 0);
  return date;
}

function classify(message: string): { transactionType: TransactionType; category: TransactionCategory } {
  const lower = message.toLowerCase();
  const hasRefund = /\brefund\b|\breversed\b|\breversal\b|\breverted\b/i.test(lower);
  if (hasRefund) {
    return { transactionType: "credit", category: "refund" };
  }

  const hasCredit = /\bcredited\b|\breceived\b|\binflow\b/i.test(lower);
  if (hasCredit) {
    return { transactionType: "credit", category: "income" };
  }

  const hasDebit = /\bdebited\b|\bdeducted\b|\bpaid\b/i.test(lower);
  if (hasDebit) {
    // Heuristic: supplier payment vs expense.
    const maybeSupplier = /\btraders\b|\benterprises\b|\bsuppl(iers|y)\b|\bmotor\b|\bsupplier\b|\bmart\b|\bvendors\b|\bdealers?\b/i.test(
      lower
    );
    return { transactionType: "debit", category: maybeSupplier ? "supplier_payment" : "expense" };
  }

  return { transactionType: "credit", category: "unknown" };
}

export function parseUpiSmsText(text: string): ParsedUpiTransaction[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  // Demo input: each SMS is often on a line; if user pastes multi-line SMS, keep grouping by blank line.
  const chunks = normalized.split(/\n\s*\n/).map((c) => c.trim());

  // Also try line-by-line fallback if only one chunk exists.
  const candidateChunks = chunks.length > 1 ? chunks : normalized.split("\n").map((l) => l.trim()).filter(Boolean);

  const results: ParsedUpiTransaction[] = [];
  for (const raw of candidateChunks) {
    const message = normalizeSpace(raw);
    if (!message) continue;

    const amount = extractAmount(message);
    if (amount === null) continue;

    const time = parseTransactionTime(message);
    const sourceApp = extractSourceApp(message);
    const customerName = extractCustomerName(message);
    const { transactionType, category } = classify(message);

    results.push({
      amount,
      customerName,
      transactionTime: time,
      transactionType,
      category,
      sourceApp,
      messageText: raw,
    });
  }
  return results;
}

