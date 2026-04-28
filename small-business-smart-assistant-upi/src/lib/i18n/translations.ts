export type SupportedLanguage = "en" | "hi" | "kn" | "ta" | "te";

// Demo-ready: English has full text; other languages are placeholders (English fallback).
export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    expenses: "Expenses",
    inventory: "Inventory",
    assistant: "Assistant",
    reports: "Reports",
    settings: "Settings",
    login: "Login",
    signup: "Sign up",
    parseUpi: "Parse UPI SMS",
    assistantHint: "Ask business questions like “How much did I earn today?”",
  },
  hi: {},
  kn: {},
  ta: {},
  te: {},
};

