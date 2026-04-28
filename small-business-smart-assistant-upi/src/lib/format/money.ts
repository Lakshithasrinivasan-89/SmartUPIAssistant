export function moneyToNumber(v: any) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v.toString());
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

