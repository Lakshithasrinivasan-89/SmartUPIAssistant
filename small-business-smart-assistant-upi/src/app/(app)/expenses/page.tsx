"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/format/money";
import type { ExpenseCategory } from "@prisma/client";

type ExpenseRow = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  expenseTime: string | null;
  createdAt: string;
};

const categories: ExpenseCategory[] = ["rent", "electricity", "stock_purchase", "transport", "miscellaneous"];

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);

  const [filters, setFilters] = useState({ from: "", to: "", category: "" as "" | ExpenseCategory });
  const [draft, setDraft] = useState({
    category: "rent" as ExpenseCategory,
    amount: "",
    note: "",
    expenseTime: "",
  });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.category) params.set("category", filters.category);
    params.set("limit", "200");
    const res = await fetch("/api/expenses?" + params.toString());
    const json = await res.json();
    setExpenses(json.expenses ?? []);
    setLoading(false);
  }

  async function addExpense() {
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: draft.category,
        amount,
        note: draft.note || null,
        expenseTime: draft.expenseTime ? new Date(draft.expenseTime).toISOString() : null,
      }),
    });
    setDraft({ category: "rent", amount: "", note: "", expenseTime: "" });
    await load();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Add Expense</CardTitle>
            <div className="text-xs text-zinc-500">Feeds profit calculation</div>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <Select label="Category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as ExpenseCategory }))}>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </Select>
            <Input label="Amount (INR)" inputMode="decimal" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} placeholder="e.g. 450" />
            <Input label="Note (optional)" value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} placeholder="e.g. transport" />
            <Input label="Expense time" type="datetime-local" value={draft.expenseTime} onChange={(e) => setDraft((d) => ({ ...d, expenseTime: e.target.value }))} />
            <Button onClick={addExpense}>Add expense</Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Filters</CardTitle>
            <div className="text-xs text-zinc-500">Refine list</div>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="From" type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
              <Input label="To" type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            </div>
            <Select label="Category" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as any }))}>
              <option value="">All</option>
              {categories.map((c) => (
                <option value={c} key={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={load}>
              Apply filters
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <div className="text-xs text-zinc-500">{expenses.length} entries</div>
        </CardHeader>

        {loading ? (
          <div className="p-4">
            <Spinner label="Loading expenses..." />
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600">No expenses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 px-3">When</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Note</th>
                  <th className="py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-200">{e.expenseTime ? new Date(e.expenseTime).toLocaleString() : "—"}</td>
                    <td className="py-2 px-3 font-medium">{e.category.replace("_", " ")}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">{e.note ?? "—"}</td>
                    <td className="py-2 px-3 font-semibold">{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

