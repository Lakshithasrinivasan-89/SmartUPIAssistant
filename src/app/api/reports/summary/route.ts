import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { csvFromSummary, getSummaryData, pdfBufferFromSummary } from "@/lib/reports/report";

export async function GET(req: Request) {
  const user = await getCurrentUserOrThrow();
  const url = new URL(req.url);
  const period = url.searchParams.get("period") as "daily" | "weekly" | "monthly";
  const date = url.searchParams.get("date") || undefined;
  const format = (url.searchParams.get("format") || "pdf").toLowerCase();

  if (!period || !["daily", "weekly", "monthly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const summary = await getSummaryData({ userId: user.id, period, date });

  if (format === "csv") {
    const csv = csvFromSummary(summary);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="upi++_${period}_${date ?? "summary"}.csv"`,
      },
    });
  }

  const pdf = await pdfBufferFromSummary(summary);
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="upi++_${period}_${date ?? "summary"}.pdf"`,
    },
  });
}

