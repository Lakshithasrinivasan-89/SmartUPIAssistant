"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ReportsPage() {
  const [dailyDate, setDailyDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  const periods = useMemo(
    () => [
      { key: "daily", label: "Daily sales" },
      { key: "weekly", label: "Weekly performance" },
      { key: "monthly", label: "Monthly performance" },
    ],
    []
  );

  async function download(period: string, format: "pdf" | "csv") {
    setBusy(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period as any);
      params.set("format", format);
      if (period === "daily") params.set("date", dailyDate);
      const res = await fetch("/api/reports/summary?" + params.toString());
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upi++_${period}_${dailyDate}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">Reports</CardTitle>
          <div className="text-xs text-zinc-500">Download as PDF or CSV</div>
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="grid grid-cols-1 gap-3">
            {periods.map((p) => (
              <div key={p.key} className="rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-xs text-zinc-500">{p.key}</div>
                </div>
                {p.key === "daily" ? (
                  <div className="mt-3">
                    <Input label="Date" type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button variant="secondary" onClick={() => download(p.key, "pdf")} disabled={busy}>
                    Download PDF
                  </Button>
                  <Button variant="ghost" onClick={() => download(p.key, "csv")} disabled={busy}>
                    Download CSV
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs font-semibold text-zinc-600">What’s included</div>
            <div className="mt-2 text-sm text-zinc-700">
              Income (credits), refunds, estimated revenue, total expenses, and estimated profit.
            </div>
            <div className="mt-3 text-xs text-zinc-500">Tip: Ensure your expenses are entered; profit depends on stored data.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

