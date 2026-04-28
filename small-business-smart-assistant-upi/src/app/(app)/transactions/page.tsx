"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/format/money";
import type { TransactionCategory, TransactionType } from "@prisma/client";

type Tx = {
  id: string;
  amount: number;
  transactionType: TransactionType;
  category: TransactionCategory;
  customerName: string | null;
  sourceApp: string | null;
  transactionTime: string | null;
  messageText: string | null;
  inventoryItemId: string | null;
  quantity: number | null;
};

const sampleMessages = [
  "UPI Success - Credited INR 540 to your account from Ravi via PhonePe. Ref No: UPI12345 on 21/03/2026",
  "UPI Debit of INR 1200 to Bharat Traders. Your UPI ID: xxxx@upi. on 20/03/2026",
  "UPI Refund credited INR 180 from Bank of India. Reversed on 19/03/2026",
  "UPI Success - Received INR 890 to your account from Meena via GPay. Ref No: UPI22345 on 21/03/2026",
];

const categoryOptions: TransactionCategory[] = ["income", "expense", "refund", "supplier_payment", "unknown"];
const typeOptions: TransactionType[] = ["credit", "debit"];

function toneForCategory(c: TransactionCategory) {
  if (c === "income") return "success";
  if (c === "expense" || c === "supplier_payment") return "danger";
  if (c === "refund") return "warning";
  return "neutral";
}

function formatWhen(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString();
}

function txTimeLocalValue(v: string | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TransactionsPage() {
  const [rawMessages, setRawMessages] = useState(sampleMessages.join("\n"));
  const [parseBusy, setParseBusy] = useState(false);
  const [parsePreview, setParsePreview] = useState<any[] | null>(null);
  const [parseSavedCount, setParseSavedCount] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);

  const [filters, setFilters] = useState({
    q: "",
    type: "" as "" | TransactionType,
    category: "" as "" | TransactionCategory,
    from: "",
    to: "",
    minAmount: "",
    maxAmount: "",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<any>({
    amount: "",
    transactionType: "credit" as TransactionType,
    category: "income" as TransactionCategory,
    messageText: "",
    customerName: "",
    sourceApp: "",
    transactionTime: "",
    inventoryItemId: "",
    quantity: 1,
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      const [txRes, itemsRes] = await Promise.all([fetchTransactions(), fetch("/api/inventory-items")]);
      const txJson = await txRes.json();
      const itemsJson = await itemsRes.json();
      if (!alive) return;
      setTransactions(txJson.transactions ?? []);
      setItems(itemsJson.items ?? []);
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTransactions() {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.minAmount) params.set("minAmount", filters.minAmount);
    if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
    params.set("limit", "120");
    const res = await fetch("/api/transactions?" + params.toString());
    return res;
  }

  async function loadWithFilters() {
    setLoading(true);
    const res = await fetchTransactions();
    const json = await res.json();
    setTransactions(json.transactions ?? []);
    setLoading(false);
  }

  async function parseAndSave() {
    setParseBusy(true);
    setParsePreview(null);
    setParseSavedCount(null);
    try {
      const res = await fetch("/api/transactions/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messagesText: rawMessages }),
      });
      const json = await res.json();
      setParsePreview(json.parsed ?? []);
      setParseSavedCount(json.saved ?? null);
      await loadWithFilters();
    } finally {
      setParseBusy(false);
    }
  }

  const inventoryOptionsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items) map.set(it.id, it.productName);
    return map;
  }, [items]);

  function openEdit(tx: Tx) {
    setEditId(tx.id);
    setEditDraft({
      amount: tx.amount,
      transactionType: tx.transactionType,
      category: tx.category,
      messageText: tx.messageText ?? "",
      customerName: tx.customerName ?? "",
      sourceApp: tx.sourceApp ?? "",
      transactionTime: txTimeLocalValue(tx.transactionTime),
      inventoryItemId: tx.inventoryItemId ?? "",
      quantity: tx.quantity ?? 1,
    });
  }

  async function submitEdit() {
    if (!editId || !editDraft) return;
    await fetch(`/api/transactions/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(editDraft.amount),
        transactionType: editDraft.transactionType,
        category: editDraft.category,
        messageText: editDraft.messageText || null,
        customerName: editDraft.customerName || null,
        sourceApp: editDraft.sourceApp || null,
        transactionTime: editDraft.transactionTime ? new Date(editDraft.transactionTime).toISOString() : null,
        inventoryItemId: editDraft.inventoryItemId || null,
        quantity: editDraft.quantity ? Number(editDraft.quantity) : null,
      }),
    });
    setEditId(null);
    setEditDraft(null);
    await loadWithFilters();
  }

  async function deleteTx(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    await loadWithFilters();
  }

  function setFilter<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  async function addTransaction() {
    const amount = Number(addDraft.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        transactionType: addDraft.transactionType,
        category: addDraft.category,
        messageText: addDraft.messageText || null,
        customerName: addDraft.customerName || null,
        sourceApp: addDraft.sourceApp || null,
        transactionTime: addDraft.transactionTime ? new Date(addDraft.transactionTime).toISOString() : null,
        inventoryItemId: addDraft.inventoryItemId || null,
        quantity: addDraft.quantity ? Number(addDraft.quantity) : null,
      }),
    });

    setAddOpen(false);
    setAddDraft({
      amount: "",
      transactionType: "credit",
      category: "income",
      messageText: "",
      customerName: "",
      sourceApp: "",
      transactionTime: "",
      inventoryItemId: "",
      quantity: 1,
    });
    await loadWithFilters();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">UPI SMS Parser (Demo)</CardTitle>
            <Badge tone="info">Paste + Save</Badge>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Paste multiple UPI SMS notifications. The parser extracts amount, time, transaction direction, and categorizes it as income/expense/refund.
            </div>

            <textarea
              className="h-44 w-full resize-none rounded-2xl border border-zinc-200 bg-white p-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              value={rawMessages}
              onChange={(e) => setRawMessages(e.target.value)}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  onClick={() => setRawMessages(sampleMessages.join("\n"))}
                  disabled={parseBusy}
                >
                  Load sample messages
                </Button>
                <Button onClick={parseAndSave} disabled={parseBusy}>
                  {parseBusy ? "Parsing..." : "Parse & Save"}
                </Button>
              </div>

              <div className="text-xs text-zinc-500">
                {parseSavedCount !== null ? `${parseSavedCount} transaction(s) saved.` : "—"}
              </div>
            </div>

            {parsePreview?.length ? (
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
                <div className="mb-2 text-xs font-semibold text-zinc-600">Parsed preview</div>
                <div className="grid grid-cols-1 gap-2">
                  {parsePreview.slice(0, 6).map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-2 text-sm">
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {p.transactionType} • {p.category.replace("_", " ")}
                        </div>
                        <div className="truncate text-xs text-zinc-600">{p.customerName ?? "—"} • {p.sourceApp ?? "—"}</div>
                      </div>
                      <div className="font-bold">{formatINR(Number(p.amount))}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Quick Filters</CardTitle>
            <Badge tone="neutral">Search</Badge>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <Input label="Search" value={filters.q} onChange={(e) => setFilter("q", e.target.value)} placeholder="customer, message, app..." />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select label="Type" value={filters.type} onChange={(e) => setFilter("type", e.target.value as any)}>
                <option value="">All</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
              <Select label="Category" value={filters.category} onChange={(e) => setFilter("category", e.target.value as any)}>
                <option value="">All</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="From" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
              <Input label="To" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Min amount"
                inputMode="numeric"
                value={filters.minAmount}
                onChange={(e) => setFilter("minAmount", e.target.value)}
                placeholder="0"
              />
              <Input
                label="Max amount"
                inputMode="numeric"
                value={filters.maxAmount}
                onChange={(e) => setFilter("maxAmount", e.target.value)}
                placeholder="5000"
              />
            </div>

            <Button onClick={loadWithFilters} variant="primary">
              Apply filters
            </Button>

            <Button onClick={() => setAddOpen(true)} variant="secondary">
              Manually add transaction
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <div className="text-xs text-zinc-500">Edit or delete wrongly parsed rows</div>
        </CardHeader>

        {loading ? (
          <div className="p-4">
            <Spinner label="Loading transactions..." />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600">No transactions match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 px-3">When</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">App</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-200">{formatWhen(t.transactionTime)}</td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-200">{t.customerName ?? "—"}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">{t.sourceApp ?? "—"}</td>
                    <td className="py-2 px-3">
                      <Badge tone={t.transactionType === "credit" ? "success" : "danger"}>{t.transactionType}</Badge>
                    </td>
                    <td className="py-2 px-3">
                      <Badge tone={toneForCategory(t.category)}>{t.category.replace("_", " ")}</Badge>
                    </td>
                    <td className="py-2 px-3 font-semibold">{formatINR(t.amount)}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(t)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => deleteTx(t.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {(editId && editDraft) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold">Edit transaction</div>
              <Button variant="ghost" onClick={() => { setEditId(null); setEditDraft(null); }}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Amount" inputMode="decimal" value={editDraft.amount} onChange={(e) => setEditDraft((d: any) => ({ ...d, amount: e.target.value }))} />
              <Select label="Type" value={editDraft.transactionType} onChange={(e) => setEditDraft((d: any) => ({ ...d, transactionType: e.target.value }))}>
                {typeOptions.map((t) => (
                  <option value={t} key={t}>{t}</option>
                ))}
              </Select>
              <Select label="Category" value={editDraft.category} onChange={(e) => setEditDraft((d: any) => ({ ...d, category: e.target.value }))}>
                {categoryOptions.map((c) => (
                  <option value={c} key={c}>{c.replace("_", " ")}</option>
                ))}
              </Select>
              <Input label="Customer name" value={editDraft.customerName} onChange={(e) => setEditDraft((d: any) => ({ ...d, customerName: e.target.value }))} />
              <Input label="Source app" value={editDraft.sourceApp} onChange={(e) => setEditDraft((d: any) => ({ ...d, sourceApp: e.target.value }))} />
              <Input label="Transaction time" type="datetime-local" value={editDraft.transactionTime} onChange={(e) => setEditDraft((d: any) => ({ ...d, transactionTime: e.target.value }))} />

              <Select label="Link inventory item (optional)" value={editDraft.inventoryItemId} onChange={(e) => setEditDraft((d: any) => ({ ...d, inventoryItemId: e.target.value }))}>
                <option value="">None</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.productName}
                  </option>
                ))}
              </Select>
              <Input label="Quantity (optional)" inputMode="numeric" value={editDraft.quantity} onChange={(e) => setEditDraft((d: any) => ({ ...d, quantity: e.target.value }))} />
            </div>

            <Input label="Message text (optional)" value={editDraft.messageText} onChange={(e) => setEditDraft((d: any) => ({ ...d, messageText: e.target.value }))} />

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => { setEditId(null); setEditDraft(null); }}>
                Cancel
              </Button>
              <Button onClick={submitEdit}>Save changes</Button>
            </div>
          </div>
        </div>
      ) : null}

      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold">Add transaction</div>
              <Button variant="ghost" onClick={() => setAddOpen(false)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Amount" inputMode="decimal" value={addDraft.amount} onChange={(e) => setAddDraft((d: any) => ({ ...d, amount: e.target.value }))} />
              <Select label="Type" value={addDraft.transactionType} onChange={(e) => setAddDraft((d: any) => ({ ...d, transactionType: e.target.value }))}>
                {typeOptions.map((t) => (
                  <option value={t} key={t}>{t}</option>
                ))}
              </Select>
              <Select label="Category" value={addDraft.category} onChange={(e) => setAddDraft((d: any) => ({ ...d, category: e.target.value }))}>
                {categoryOptions.map((c) => (
                  <option value={c} key={c}>{c.replace("_", " ")}</option>
                ))}
              </Select>
              <Input label="Customer name" value={addDraft.customerName} onChange={(e) => setAddDraft((d: any) => ({ ...d, customerName: e.target.value }))} />
              <Input label="Source app" value={addDraft.sourceApp} onChange={(e) => setAddDraft((d: any) => ({ ...d, sourceApp: e.target.value }))} />
              <Input label="Transaction time" type="datetime-local" value={addDraft.transactionTime} onChange={(e) => setAddDraft((d: any) => ({ ...d, transactionTime: e.target.value }))} />

              <Select label="Link inventory item (optional)" value={addDraft.inventoryItemId} onChange={(e) => setAddDraft((d: any) => ({ ...d, inventoryItemId: e.target.value }))}>
                <option value="">None</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.productName}
                  </option>
                ))}
              </Select>
              <Input label="Quantity (optional)" inputMode="numeric" value={addDraft.quantity} onChange={(e) => setAddDraft((d: any) => ({ ...d, quantity: e.target.value }))} />
            </div>

            <Input label="Message text (optional)" value={addDraft.messageText} onChange={(e) => setAddDraft((d: any) => ({ ...d, messageText: e.target.value }))} />

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTransaction}>Add</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

