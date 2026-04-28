"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/format/money";

type InventoryItem = {
  id: string;
  productName: string;
  category: string;
  stockQuantity: number;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
};

type Suggestion = {
  itemId: string;
  productName: string;
  category: string;
  stockQuantity: number;
  reorderLevel: number;
  avgDailySold: number;
  projectedDaysLeft: number | null;
  isLowStock: boolean;
  recommendation: string;
  movement: "fast" | "slow" | "medium";
  soldQtyLast14d: number;
};

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    productName: "",
    category: "",
    stockQuantity: "0",
    costPrice: "0",
    sellingPrice: "0",
    reorderLevel: "0",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const [itemsRes, suggRes] = await Promise.all([fetch("/api/inventory-items"), fetch("/api/inventory-items/suggestions")]);
      const itemsJson = await itemsRes.json();
      const suggJson = await suggRes.json();
      if (!alive) return;
      setItems(itemsJson.items ?? []);
      setSuggestions(suggJson.suggestions ?? []);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const suggestionById = useMemo(() => {
    const map = new Map<string, Suggestion>();
    for (const s of suggestions) map.set(s.itemId, s);
    return map;
  }, [suggestions]);

  async function reload() {
    const [itemsRes, suggRes] = await Promise.all([fetch("/api/inventory-items"), fetch("/api/inventory-items/suggestions")]);
    const itemsJson = await itemsRes.json();
    const suggJson = await suggRes.json();
    setItems(itemsJson.items ?? []);
    setSuggestions(suggJson.suggestions ?? []);
  }

  async function addItem() {
    const body = {
      productName: draft.productName,
      category: draft.category,
      stockQuantity: Number(draft.stockQuantity),
      costPrice: Number(draft.costPrice),
      sellingPrice: Number(draft.sellingPrice),
      reorderLevel: Number(draft.reorderLevel),
    };
    await fetch("/api/inventory-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setAddOpen(false);
    setDraft({ productName: "", category: "", stockQuantity: "0", costPrice: "0", sellingPrice: "0", reorderLevel: "0" });
    await reload();
  }

  function openEdit(item: InventoryItem) {
    setEditId(item.id);
    setEditDraft({ ...item });
    setEditOpen(true);
  }

  async function submitEdit() {
    if (!editId || !editDraft) return;
    await fetch(`/api/inventory-items/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: editDraft.productName,
        category: editDraft.category,
        stockQuantity: Number(editDraft.stockQuantity),
        costPrice: Number(editDraft.costPrice),
        sellingPrice: Number(editDraft.sellingPrice),
        reorderLevel: Number(editDraft.reorderLevel),
      }),
    });
    setEditOpen(false);
    setEditId(null);
    setEditDraft(null);
    await reload();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/inventory-items/${id}`, { method: "DELETE" });
    await reload();
  }

  const lowStock = suggestions.filter((s) => s.isLowStock);
  const fastMoving = suggestions.filter((s) => s.movement === "fast");
  const slowMoving = suggestions.filter((s) => s.movement === "slow");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Inventory Alerts</CardTitle>
            <Badge tone="info">Smart</Badge>
          </CardHeader>

          {lowStock.length === 0 ? (
            <div className="text-sm text-zinc-600">No low-stock items based on recent sales.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {lowStock.slice(0, 4).map((s) => (
                <div key={s.itemId} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                  <div className="font-semibold">{s.productName}</div>
                  <div className="mt-1 text-sm text-red-800">Stock: {s.stockQuantity} (reorder at {s.reorderLevel})</div>
                  <div className="mt-2 text-sm text-red-900/80">{s.recommendation}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(true)}>
              Add new item
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold">Restocking Suggestions</CardTitle>
            <Badge tone="neutral">14-day trend</Badge>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="text-xs font-semibold text-zinc-500">Fast-moving</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">{fastMoving[0]?.productName ?? "—"}</div>
                <div className="text-xs text-zinc-600 mt-1">Reorder before the peak window.</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="text-xs font-semibold text-zinc-500">Slow-moving</div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">{slowMoving[0]?.productName ?? "—"}</div>
                <div className="text-xs text-zinc-600 mt-1">Avoid overstock; consider bundles.</div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="text-xs font-semibold text-zinc-500">All suggestions</div>
              <div className="mt-2 flex flex-col gap-2">
                {suggestions
                  .slice()
                  .sort((a, b) => Number(b.isLowStock) - Number(a.isLowStock))
                  .slice(0, 6)
                  .map((s) => (
                    <div key={s.itemId} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate font-semibold">{s.productName}</div>
                          {s.isLowStock ? <Badge tone="danger">Low</Badge> : <Badge tone="success">OK</Badge>}
                          <Badge tone="neutral">{s.movement}</Badge>
                        </div>
                        <div className="text-xs text-zinc-600 mt-1">
                          Sold last 14d: {s.soldQtyLast14d} • Est. days left: {s.projectedDaysLeft !== null ? s.projectedDaysLeft.toFixed(1) : "—"}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{formatINR(s.sellingPrice)} </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <div className="text-xs text-zinc-500">{items.length} items</div>
        </CardHeader>

        {loading ? (
          <div className="p-4">
            <Spinner label="Loading inventory..." />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-zinc-600">No items yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Stock</th>
                  <th className="py-2 px-3">Reorder</th>
                  <th className="py-2 px-3">Cost</th>
                  <th className="py-2 px-3">Selling</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => {
                  const s = suggestionById.get(it.id);
                  return (
                    <tr key={it.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="py-2 px-3">
                        <div className="font-semibold">{it.productName}</div>
                        <div className="text-xs text-zinc-600">{s ? `Movement: ${s.movement}` : ""}</div>
                      </td>
                      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-300">{it.category}</td>
                      <td className="py-2 px-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {s?.isLowStock ? <Badge tone="danger">Low</Badge> : <Badge tone="success">OK</Badge>}
                          {it.stockQuantity}
                        </div>
                      </td>
                      <td className="py-2 px-3">{it.reorderLevel}</td>
                      <td className="py-2 px-3">{formatINR(it.costPrice)}</td>
                      <td className="py-2 px-3">{formatINR(it.sellingPrice)}</td>
                      <td className="py-2 px-3">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEdit(it)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteItem(it.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold">Add inventory item</div>
              <Button variant="ghost" onClick={() => setAddOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Product name" value={draft.productName} onChange={(e) => setDraft((d) => ({ ...d, productName: e.target.value }))} />
              <Input label="Category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
              <Input label="Stock quantity" inputMode="numeric" value={draft.stockQuantity} onChange={(e) => setDraft((d) => ({ ...d, stockQuantity: e.target.value }))} />
              <Input label="Reorder level" inputMode="numeric" value={draft.reorderLevel} onChange={(e) => setDraft((d) => ({ ...d, reorderLevel: e.target.value }))} />
              <Input label="Cost price" inputMode="decimal" value={draft.costPrice} onChange={(e) => setDraft((d) => ({ ...d, costPrice: e.target.value }))} />
              <Input label="Selling price" inputMode="decimal" value={draft.sellingPrice} onChange={(e) => setDraft((d) => ({ ...d, sellingPrice: e.target.value }))} />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addItem}>Add</Button>
            </div>
          </div>
        </div>
      ) : null}

      {editOpen && editId && editDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-lg font-extrabold">Edit item</div>
              <Button variant="ghost" onClick={() => setEditOpen(false)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Product name" value={editDraft.productName} onChange={(e) => setEditDraft((d: any) => ({ ...d, productName: e.target.value }))} />
              <Input label="Category" value={editDraft.category} onChange={(e) => setEditDraft((d: any) => ({ ...d, category: e.target.value }))} />
              <Input label="Stock quantity" inputMode="numeric" value={editDraft.stockQuantity} onChange={(e) => setEditDraft((d: any) => ({ ...d, stockQuantity: e.target.value }))} />
              <Input label="Reorder level" inputMode="numeric" value={editDraft.reorderLevel} onChange={(e) => setEditDraft((d: any) => ({ ...d, reorderLevel: e.target.value }))} />
              <Input label="Cost price" inputMode="decimal" value={editDraft.costPrice} onChange={(e) => setEditDraft((d: any) => ({ ...d, costPrice: e.target.value }))} />
              <Input label="Selling price" inputMode="decimal" value={editDraft.sellingPrice} onChange={(e) => setEditDraft((d: any) => ({ ...d, sellingPrice: e.target.value }))} />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitEdit}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

