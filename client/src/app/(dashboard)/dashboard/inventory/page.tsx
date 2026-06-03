"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  History,
  X,
  Loader2,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  Edit2,
} from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN" | "DAMAGE";

interface Variant {
  id: string;
  sku: string;
  price: string;
  stock: number;
  lowStockThreshold: number;
  product: { name: string; id: string };
  movements?: Movement[];
}

interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  notes?: string;
  createdAt: string;
  variant?: { sku: string; product?: { name: string } };
  user?: {
    profile?: { firstName?: string; lastName?: string };
    email?: string;
  };
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${Cookies.get("accessToken")}`,
    "Content-Type": "application/json",
  };
}

const MOVEMENT_META: Record<
  MovementType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  IN: {
    label: "Stock In",
    color: "bg-emerald-100 text-emerald-700",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
  },
  OUT: {
    label: "Stock Out",
    color: "bg-red-100 text-red-700",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
  },
  ADJUSTMENT: {
    label: "Adjustment",
    color: "bg-blue-100 text-blue-700",
    icon: <Edit2 className="h-3.5 w-3.5" />,
  },
  RETURN: {
    label: "Return",
    color: "bg-amber-100 text-amber-700",
    icon: <ArrowUp className="h-3.5 w-3.5" />,
  },
  DAMAGE: {
    label: "Damage",
    color: "bg-zinc-100 text-zinc-600",
    icon: <ArrowDown className="h-3.5 w-3.5" />,
  },
};

const MOVEMENT_TYPES: MovementType[] = [
  "IN",
  "OUT",
  "ADJUSTMENT",
  "RETURN",
  "DAMAGE",
];

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState<Variant[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"stock" | "log">("stock");

  // Adjust stock modal
  const [adjustTarget, setAdjustTarget] = useState<Variant | null>(null);
  const [adjustType, setAdjustType] = useState<MovementType>("IN");
  const [adjustQty, setAdjustQty] = useState("1");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  // Threshold modal
  const [thresholdTarget, setThresholdTarget] = useState<Variant | null>(null);
  const [newThreshold, setNewThreshold] = useState("");
  const [savingThreshold, setSavingThreshold] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders();
      const [lsRes, mvRes] = await Promise.all([
        fetch(`${BASE_URL}/inventory/low-stock`, { headers }),
        fetch(`${BASE_URL}/inventory/movements`, { headers }),
      ]);
      if (!lsRes.ok)
        throw new Error(
          "Failed to fetch inventory data. Make sure you are logged in as admin.",
        );
      const [lsData, mvData] = await Promise.all([lsRes.json(), mvRes.json()]);
      const resolvedLowStock = lsData?.success ? lsData.data : lsData;
      const resolvedMovements = mvData?.success ? mvData.data : mvData;
      setLowStock(Array.isArray(resolvedLowStock) ? resolvedLowStock : []);
      setMovements(Array.isArray(resolvedMovements) ? resolvedMovements : []);
    } catch (err: any) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    setAdjusting(true);
    setAdjustError("");
    try {
      const res = await fetch(`${BASE_URL}/inventory/movements`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          variantId: adjustTarget.id,
          type: adjustType,
          quantity: parseInt(adjustQty),
          notes: adjustNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to adjust stock.");
      setAdjustTarget(null);
      setAdjustQty("1");
      setAdjustNotes("");
      await fetchData();
    } catch (err: any) {
      setAdjustError(err.message || "An error occurred.");
    } finally {
      setAdjusting(false);
    }
  };

  const handleThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdTarget) return;
    setSavingThreshold(true);
    try {
      const res = await fetch(
        `${BASE_URL}/inventory/threshold/${thresholdTarget.id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ lowStockThreshold: parseInt(newThreshold) }),
        },
      );
      if (!res.ok) throw new Error("Failed to update threshold.");
      setThresholdTarget(null);
      await fetchData();
    } catch {
      // silently fail
    } finally {
      setSavingThreshold(false);
    }
  };

  const filteredMovements = movements.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.variant?.product?.name?.toLowerCase().includes(q) ||
      m.variant?.sku?.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-text-main">Inventory</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border-main h-24 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-surface rounded-xl border border-border-main h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-text-main mb-6">Inventory</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <Package className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Inventory</h1>
          <p className="text-text-muted text-sm mt-1">
            Manage stock levels and track movements
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Low Stock Alerts
            </p>
            <p className="text-2xl font-black text-red-600 mt-0.5">
              {lowStock.length}
            </p>
          </div>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Total Movements
            </p>
            <p className="text-2xl font-black text-text-main mt-0.5">
              {movements.length}
            </p>
          </div>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Stock Ins (Total)
            </p>
            <p className="text-2xl font-black text-text-main mt-0.5">
              {
                movements.filter((m) => m.type === "IN" || m.type === "RETURN")
                  .length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Banner */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">
              {lowStock.length} product variant
              {lowStock.length > 1 ? "s are" : " is"} running low on stock
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {lowStock
                .map(
                  (v) =>
                    `${v.product?.name} (${v.sku}: ${v.stock}/${v.lowStockThreshold})`,
                )
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-background p-1 rounded-xl border border-border-main w-fit">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "stock" ? "bg-surface shadow text-text-main" : "text-text-muted hover:text-text-main"}`}
        >
          Low Stock Items
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "log" ? "bg-surface shadow text-text-main" : "text-text-muted hover:text-text-main"}`}
        >
          Movement Log
        </button>
      </div>

      {/* Low Stock Tab */}
      {activeTab === "stock" && (
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lowStock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Package className="h-12 w-12 text-text-muted" />
                      <p className="font-medium text-zinc-600">
                        All products are sufficiently stocked!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                lowStock.map((variant) => {
                  const pct = Math.min(
                    (variant.stock / variant.lowStockThreshold) * 100,
                    100,
                  );
                  return (
                    <tr
                      key={variant.id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-text-main">
                          {variant.product?.name}
                        </p>
                        <p className="text-xs text-text-muted font-mono">
                          {variant.sku}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium text-text-main">
                        ৳{Number(variant.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-black ${variant.stock === 0 ? "text-red-600" : "text-amber-600"}`}
                          >
                            {variant.stock}
                          </span>
                          <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${variant.stock === 0 ? "bg-red-500" : "bg-amber-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm">
                        {variant.lowStockThreshold}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAdjustTarget(variant);
                              setAdjustType("IN");
                              setAdjustQty("1");
                              setAdjustNotes("");
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Adjust Stock
                          </button>
                          <button
                            onClick={() => {
                              setThresholdTarget(variant);
                              setNewThreshold(
                                String(variant.lowStockThreshold),
                              );
                            }}
                            className="px-3 py-1.5 bg-surface border border-border-main text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            Set Alert
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Movement Log Tab */}
      {activeTab === "log" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movements by product, SKU, type, or notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>
          <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">Product / SKU</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4">By</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <History className="h-12 w-12 text-text-muted" />
                        <p className="font-medium text-zinc-600">
                          {search
                            ? "No movements match your search."
                            : "No movements recorded yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => {
                    const meta =
                      MOVEMENT_META[m.type] || MOVEMENT_META.ADJUSTMENT;
                    const userName =
                      `${m.user?.profile?.firstName ?? ""} ${m.user?.profile?.lastName ?? ""}`.trim();
                    const date = new Date(m.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    );
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-zinc-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-main">
                            {m.variant?.product?.name ?? "—"}
                          </p>
                          <p className="text-xs text-text-muted font-mono">
                            {m.variant?.sku}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-black text-sm ${m.quantity > 0 ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {m.quantity > 0 ? "+" : ""}
                            {m.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted max-w-xs truncate">
                          {m.notes ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {userName || m.user?.email || "System"}
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {date}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-main">Adjust Stock</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {adjustTarget.product?.name} — {adjustTarget.sku} (Current:{" "}
                  {adjustTarget.stock})
                </p>
              </div>
              <button
                onClick={() => setAdjustTarget(null)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              {adjustError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">
                  {adjustError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Movement Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOVEMENT_TYPES.map((t) => {
                    const meta = MOVEMENT_META[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAdjustType(t)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${adjustType === t ? `${meta.color} border-current` : "border-border-main text-text-muted hover:bg-zinc-50"}`}
                      >
                        {meta.icon}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Restock from supplier, damaged goods…"
                  className="w-full px-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="flex-1 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {adjusting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {thresholdTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between">
              <h3 className="font-bold text-text-main">
                Update Alert Threshold
              </h3>
              <button
                onClick={() => setThresholdTarget(null)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            <form onSubmit={handleThreshold} className="p-6 space-y-4">
              <p className="text-sm text-text-muted">
                Set the minimum stock level for{" "}
                <span className="font-bold text-text-main">
                  {thresholdTarget.product?.name} ({thresholdTarget.sku})
                </span>{" "}
                before a low-stock alert is triggered.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Alert Threshold (units)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setThresholdTarget(null)}
                  className="flex-1 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingThreshold}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingThreshold && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
