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
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
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
  const [allVariants, setAllVariants] = useState<Variant[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter state
  const [stockSearch, setStockSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"stock" | "log">("stock");

  // Movement Log search & filter
  const [logSearch, setLogSearch] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("ALL");

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
      const [lsRes, mvRes, avRes] = await Promise.all([
        fetch(`${BASE_URL}/inventory/low-stock`, { headers }),
        fetch(`${BASE_URL}/inventory/movements`, { headers }),
        fetch(`${BASE_URL}/inventory/variants`, { headers }),
      ]);
      if (!lsRes.ok || !avRes.ok) {
        throw new Error(
          "Failed to fetch inventory data. Make sure you are logged in as admin."
        );
      }
      const [lsData, mvData, avData] = await Promise.all([
        lsRes.json(),
        mvRes.json(),
        avRes.json(),
      ]);
      
      const resolvedLowStock = lsData?.success ? lsData.data : lsData;
      const resolvedMovements = mvData?.success ? mvData.data : mvData;
      const resolvedAllVariants = avData?.success ? avData.data : avData;

      setLowStock(Array.isArray(resolvedLowStock) ? resolvedLowStock : []);
      setMovements(Array.isArray(resolvedMovements) ? resolvedMovements : []);
      setAllVariants(Array.isArray(resolvedAllVariants) ? resolvedAllVariants : []);
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
        }
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

  // Stock filtering
  const filteredVariants = allVariants.filter((variant) => {
    const matchesSearch =
      variant.product?.name?.toLowerCase().includes(stockSearch.toLowerCase()) ||
      variant.sku?.toLowerCase().includes(stockSearch.toLowerCase());
    
    const isLow = variant.stock <= variant.lowStockThreshold;

    if (showLowStockOnly) {
      return matchesSearch && isLow;
    }
    return matchesSearch;
  });

  // Movement filtering
  const filteredMovements = movements.filter((m) => {
    const q = logSearch.toLowerCase();
    const matchesSearch =
      m.variant?.product?.name?.toLowerCase().includes(q) ||
      m.variant?.sku?.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q);

    const matchesType = logTypeFilter === "ALL" || m.type === logTypeFilter;

    return matchesSearch && matchesType;
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
            Manage stock levels, thresholds, and track movements across all products.
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
                .slice(0, 5)
                .map(
                  (v) =>
                    `${v.product?.name} (${v.sku}: ${v.stock}/${v.lowStockThreshold})`
                )
                .join(" · ")}
              {lowStock.length > 5 && ` and ${lowStock.length - 5} more.`}
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
          Stock Levels
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "log" ? "bg-surface shadow text-text-main" : "text-text-muted hover:text-text-main"}`}
        >
          Movement Log
        </button>
      </div>

      {/* Stock Levels Tab */}
      {activeTab === "stock" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded border-border-main text-red-500 focus:ring-red-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5 text-red-600 font-bold">
                  <AlertTriangle className="h-4 w-4" />
                  Show Low Stock Only
                </span>
              </label>
            </div>
          </div>

          {/* Variants Table */}
          <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">Product / SKU</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-40">
                        <Package className="h-12 w-12 text-text-muted" />
                        <p className="font-medium text-zinc-600">
                          {stockSearch
                            ? "No products match your criteria."
                            : "All products are sufficiently stocked!"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((variant) => {
                    const isLow = variant.stock <= variant.lowStockThreshold;
                    const pct = Math.max(
                      0,
                      Math.min(
                        (variant.stock / Math.max(1, variant.lowStockThreshold)) * 100,
                        100
                      )
                    );
                    
                    let progressColor = "bg-emerald-500";
                    let textStockColor = "text-emerald-600";
                    if (variant.stock === 0) {
                      progressColor = "bg-red-500";
                      textStockColor = "text-red-600";
                    } else if (isLow) {
                      progressColor = "bg-amber-500";
                      textStockColor = "text-amber-600";
                    }

                    return (
                      <tr
                        key={variant.id}
                        className={`hover:bg-zinc-50/50 transition-colors ${isLow ? "bg-red-50/10" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-text-main">
                            {variant.product?.name}
                          </p>
                          <p className="text-xs text-text-muted font-mono mt-0.5">
                            {variant.sku}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-medium text-text-main">
                          ৳{Number(variant.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-black w-8 ${textStockColor}`}>
                              {variant.stock}
                            </span>
                            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {variant.stock === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted text-sm font-medium">
                          {variant.lowStockThreshold}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setAdjustTarget(variant);
                                setAdjustType("IN");
                                setAdjustQty("1");
                                setAdjustNotes("");
                              }}
                              className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              Adjust Stock
                            </button>
                            <button
                              onClick={() => {
                                setThresholdTarget(variant);
                                setNewThreshold(
                                  String(variant.lowStockThreshold)
                                );
                              }}
                              className="px-3 py-1.5 bg-surface border border-border-main text-xs font-medium rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer text-text-main"
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
        </div>
      )}

      {/* Movement Log Tab */}
      {activeTab === "log" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls */}
          <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search movements by product, SKU, or notes..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-text-muted" />
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
                className="bg-background border border-border-main rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-zinc-900 outline-none text-text-main font-semibold"
              >
                <option value="ALL">All Movement Types</option>
                {MOVEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "IN" ? "Stock In" : t === "OUT" ? "Stock Out" : t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
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
                          {logSearch || logTypeFilter !== "ALL"
                            ? "No movements match your filters."
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
                      }
                    );
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-main">
                            {m.variant?.product?.name ?? "—"}
                          </p>
                          <p className="text-xs text-text-muted font-mono mt-0.5">
                            {m.variant?.sku}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${meta.color}`}
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
                        <td className="px-6 py-4 text-xs text-text-muted font-semibold">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-main">Adjust Stock</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {adjustTarget.product?.name} — {adjustTarget.sku} (Current:{" "}
                  <span className="font-black text-zinc-900">{adjustTarget.stock}</span>)
                </p>
              </div>
              <button
                onClick={() => setAdjustTarget(null)}
                className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer text-text-muted hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              {adjustError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-bold">
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
                        className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer justify-center ${adjustType === t ? `${meta.color} border-current ring-1 ring-current` : "border-border-main text-text-muted hover:bg-zinc-50"}`}
                      >
                        {meta.icon}
                        {t === "IN" ? "In" : t === "OUT" ? "Out" : t.charAt(0) + t.slice(1).toLowerCase()}
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
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {thresholdTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between">
              <h3 className="font-bold text-text-main">
                Update Alert Threshold
              </h3>
              <button
                onClick={() => setThresholdTarget(null)}
                className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer text-text-muted hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleThreshold} className="p-6 space-y-4">
              <p className="text-sm text-text-muted leading-relaxed">
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
