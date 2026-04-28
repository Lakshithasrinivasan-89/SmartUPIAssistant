"use client";

import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import type { TransactionCategory } from "@prisma/client";
import { moneyToNumber, formatINR } from "@/lib/format/money";

type DashboardResponse = any;

function toneForCategory(c: TransactionCategory) {
  if (c === "income") return "success";
  if (c === "expense" || c === "supplier_payment") return "danger";
  if (c === "refund") return "warning";
  return "neutral";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const [dashRes, alertsRes] = await Promise.all([fetch("/api/analytics/dashboard"), fetch("/api/alerts")]);
      const dashJson = await dashRes.json();
      const alertsJson = await alertsRes.json();
      if (!alive) return;
      setData(dashJson);
      setAlerts(alertsJson.alerts ?? []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const trend = useMemo(() => data?.chart?.days ?? [], [data]);

  if (loading || !data) {
    return (
      <div className="p-2">
        <Spinner label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today’s Sales</CardTitle>
            <Badge tone="success">Today</Badge>
          </CardHeader>
          <CardValue>{formatINR(moneyToNumber(data.today.revenue))}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales</CardTitle>
            <Badge tone="info">7 days</Badge>
          </CardHeader>
          <CardValue>{formatINR(moneyToNumber(data.weekly.revenue))}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <Badge tone="info">This month</Badge>
          </CardHeader>
          <CardValue>{formatINR(moneyToNumber(data.monthly.revenue))}</CardValue>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimated Profit (Week)</CardTitle>
            <Badge tone="warning">Income - Expenses</Badge>
          </CardHeader>
          <CardValue>{formatINR(moneyToNumber(data.profit.estimatedWeek))}</CardValue>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 14 Days)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/transactions")}>
              View transactions
            </Button>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
                <YAxis tickFormatter={(v) => `₹${Math.round(v)}`} />
                <Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Peak Business Hours</CardTitle>
              <Badge tone="success">Best window</Badge>
            </CardHeader>
            <CardValue className="text-xl">{data.peakSalesHours.rangeLabel}</CardValue>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{data.insights.bestTime}</div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Transaction Value</CardTitle>
              <Badge tone="neutral">This week</Badge>
            </CardHeader>
            <CardValue className="text-xl">{formatINR(data.averageTransactionValue)}</CardValue>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Try increasing average basket size during peak hours.
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <div className="text-xs text-zinc-500">Parsed + manual entries</div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 px-3">When</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">App</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t: any) => (
                  <tr key={t.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-200">
                      {t.transactionTime ? new Date(t.transactionTime).toLocaleString() : "—"}
                    </td>
                    <td className="py-2 px-3">
                      <Badge tone={t.transactionType === "credit" ? "success" : "danger"}>
                        {t.transactionType}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge tone={toneForCategory(t.category)}>{t.category.replace("_", " ")}</Badge>
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-200">{t.customerName ?? "—"}</td>
                    <td className="py-2 px-3 font-semibold">{formatINR(t.amount)}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">{t.sourceApp ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Alerts</CardTitle>
              <Badge tone="info">Actionable</Badge>
            </CardHeader>
            {alerts.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No alerts right now.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {alerts.map((a, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                    <div className="font-semibold">{a.type.replaceAll("_", " ")}</div>
                    <div className="text-zinc-600 dark:text-zinc-300">{a.message}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <Badge tone="neutral">Demo</Badge>
            </CardHeader>
            <div className="flex flex-col gap-2">
              <Button onClick={() => (window.location.href = "/transactions")} variant="secondary">
                Parse UPI SMS (Demo)
              </Button>
              <Button onClick={() => (window.location.href = "/expenses")} variant="secondary">
                Add today’s expenses
              </Button>
              <Button onClick={() => (window.location.href = "/assistant")} variant="secondary">
                Ask AI Assistant
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

