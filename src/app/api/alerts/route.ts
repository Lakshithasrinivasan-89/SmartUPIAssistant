import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/analytics/dashboard";
import { getInventorySuggestions } from "@/lib/inventory/suggestions";

export async function GET() {
  const user = await getCurrentUserOrThrow();
  const dashboard = await getDashboardData(user.id);
  const inv = await getInventorySuggestions(user.id);

  const lowStock = inv.filter((s) => s.isLowStock);
  const fast = inv.filter((s) => s.movement === "fast");

  const alerts: Array<{ type: string; message: string }> = [];
  if (lowStock.length > 0) {
    alerts.push({
      type: "low_stock",
      message: `Low stock: ${lowStock
        .slice(0, 3)
        .map((s) => `${s.productName} (stock ${s.stockQuantity})`)
        .join(", ")}.`,
    });
  } else {
    alerts.push({ type: "low_stock", message: "Inventory looks healthy right now." });
  }

  alerts.push({ type: "unusual_sales_dip", message: dashboard.insights.salesDip });
  alerts.push({ type: "peak_hour", message: `Peak hour: ${dashboard.peakSalesHours.rangeLabel}.` });

  if (fast.length > 0) {
    alerts.push({ type: "top_selling_restock", message: `Top-selling right now: ${fast[0].productName}. Reorder before the peak window.` });
  }

  return NextResponse.json({ alerts });
}

