"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Tag,
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minPurchaseAmount: string | null;
  maxDiscount: string | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${Cookies.get("accessToken")}`,
    "Content-Type": "application/json",
  };
}

const EMPTY_FORM = {
  code: "",
  discountType: "PERCENTAGE" as DiscountType,
  discountValue: "",
  minPurchaseAmount: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  isActive: true,
};

export default function DiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/coupons`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok)
        throw new Error(
          "Failed to fetch coupons. Make sure you are logged in as admin.",
        );
      const data = await res.json();
      const resolved = data?.success ? data.data : data;
      setCoupons(Array.isArray(resolved) ? resolved : []);
    } catch (err: any) {
      setError(err.message || "Failed to load discounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
        setDeleteConfirmId(null);
      }
    };
    if (showModal || deleteConfirmId) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showModal, deleteConfirmId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const payload: any = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        startDate: form.startDate,
        endDate: form.endDate,
        isActive: form.isActive,
      };
      if (form.minPurchaseAmount)
        payload.minPurchaseAmount = parseFloat(form.minPurchaseAmount);
      if (form.maxDiscount) payload.maxDiscount = parseFloat(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = parseInt(form.usageLimit);

      const res = await fetch(`${BASE_URL}/coupons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create coupon.");
      setShowModal(false);
      setForm(EMPTY_FORM);
      await fetchCoupons();
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete coupon.");
      setDeleteConfirmId(null);
      await fetchCoupons();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    try {
      const res = await fetch(`${BASE_URL}/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update coupon.");
      await fetchCoupons();
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            Discounts & Coupons
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage promotional codes and discount rules
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowModal(true);
            setSaveError("");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="px-6 py-5 border-b border-zinc-100 animate-pulse flex gap-4"
              >
                <div className="h-4 bg-zinc-100 rounded flex-1" />
                <div className="h-4 bg-zinc-100 rounded w-24" />
                <div className="h-4 bg-zinc-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Tag className="h-12 w-12 text-text-muted mb-3" />
            <p className="font-medium text-zinc-600">
              No coupons yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Valid Until</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.endDate);
                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-text-main bg-zinc-100 px-2 py-1 rounded-md text-xs">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          {coupon.discountType === "PERCENTAGE" ? (
                            <Percent className="h-3 w-3" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          {coupon.discountType === "PERCENTAGE"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-text-main">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${Number(coupon.discountValue).toFixed(0)}%`
                          : `৳${Number(coupon.discountValue).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3 text-text-muted" />
                          <span
                            className={
                              expired
                                ? "text-red-500 font-bold"
                                : "text-text-muted"
                            }
                          >
                            {new Date(coupon.endDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {expired && " (Expired)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-main font-medium">
                          {coupon.usedCount}
                          {coupon.usageLimit
                            ? ` / ${coupon.usageLimit}`
                            : " (Unlimited)"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {coupon.isActive && !expired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600">
                              <XCircle className="h-3 w-3" />
                              {expired ? "Expired" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active */}
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            disabled={togglingId === coupon.id || expired}
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {togglingId === coupon.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                            ) : coupon.isActive ? (
                              <ToggleRight className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-zinc-400" />
                            )}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(coupon.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-text-muted" />
                <h3 className="font-bold text-text-main">Create Coupon</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="overflow-y-auto flex-1 p-6 space-y-5"
            >
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                  {saveError}
                </div>
              )}

              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Coupon Code *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm font-mono focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Type *
                  </label>
                  <select
                    required
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target.value as DiscountType,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    {form.discountType === "PERCENTAGE"
                      ? "Discount %"
                      : "Discount ৳"}{" "}
                    *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={
                      form.discountType === "PERCENTAGE"
                        ? "e.g. 20"
                        : "e.g. 10.00"
                    }
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Start Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    End Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Min. Purchase (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    value={form.minPurchaseAmount}
                    onChange={(e) =>
                      setForm({ ...form, minPurchaseAmount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Max Discount (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                    disabled={form.discountType !== "PERCENTAGE"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave blank for unlimited"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border-main">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className="cursor-pointer"
                >
                  {form.isActive ? (
                    <ToggleRight className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-zinc-400" />
                  )}
                </button>
                <span className="text-sm font-medium text-text-main">
                  {form.isActive
                    ? "Active — Customers can use this coupon"
                    : "Inactive — Coupon is disabled"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-sm p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-text-main">Delete Coupon</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-text-muted">
              Are you sure you want to permanently delete this coupon code?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
