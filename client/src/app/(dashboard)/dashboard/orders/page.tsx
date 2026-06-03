"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  Eye,
  X,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  variant: {
    sku: string;
    product: { name: string };
  };
}

interface Order {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: string;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  total: string;
  createdAt: string;
  user: { email: string; profile?: { firstName?: string; lastName?: string } };
  items: OrderItem[];
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${Cookies.get("accessToken")}`,
    "Content-Type": "application/json",
  };
}

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-violet-100 text-violet-700",
    icon: <Truck className="h-3.5 w-3.5" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  RETURNED: {
    label: "Returned",
    color: "bg-zinc-100 text-zinc-600",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; color: string }> = {
  PENDING: { label: "Unpaid", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-zinc-100 text-zinc-600" },
};

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Payment popup state
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>("PENDING");
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const paymentModalRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok)
        throw new Error(
          "Failed to fetch orders. Make sure you are logged in as admin.",
        );
      const data = await res.json();
      const resolvedOrders = data?.success ? data.data : data;
      setOrders(Array.isArray(resolvedOrders) ? resolvedOrders : []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        paymentModalRef.current &&
        !paymentModalRef.current.contains(e.target as Node)
      ) {
        setPaymentOrder(null);
      }
    };
    if (paymentOrder) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paymentOrder]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    setOpenDropdown(null);
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order status.");
      const rawData = await res.json();
      const updated = rawData?.success ? rawData.data : rawData;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } catch {
      // silently fail, user can retry
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaymentStatus = async () => {
    if (!paymentOrder) return;
    setUpdatingPayment(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/${paymentOrder.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentStatus: selectedPaymentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update payment status.");
      const rawData = await res.json();
      const updated = rawData?.success ? rawData.data : rawData;
      setOrders((prev) =>
        prev.map((o) => (o.id === paymentOrder.id ? updated : o)),
      );
      if (selectedOrder?.id === paymentOrder.id) setSelectedOrder(updated);
      setPaymentOrder(null);
    } catch {
      // silently fail
    } finally {
      setUpdatingPayment(false);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const customerName =
      `${o.user?.profile?.firstName ?? ""} ${o.user?.profile?.lastName ?? ""}`.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      customerName.includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.paymentStatus.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-text-main">Orders</h1>
        <div className="bg-surface rounded-xl border border-border-main overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="px-6 py-5 border-b border-zinc-100 animate-pulse flex gap-4"
            >
              <div className="h-4 bg-zinc-100 rounded flex-1" />
              <div className="h-4 bg-zinc-100 rounded w-24" />
              <div className="h-4 bg-zinc-100 rounded w-20" />
              <div className="h-4 bg-zinc-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-text-main mb-6">Orders</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-red-400 mx-auto mb-3" />
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
          <h1 className="text-2xl font-bold text-text-main">Orders</h1>
          <p className="text-text-muted text-sm mt-1">
            {orders.length} total orders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by order ID, customer, status or payment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <ShoppingCart className="h-12 w-12 text-text-muted" />
                    <p className="font-medium text-zinc-600">
                      {search ? "No orders match your search" : "No orders yet"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const sm = STATUS_META[order.status] || STATUS_META.PENDING;
                const pm =
                  PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING;
                const customerName =
                  `${order.user?.profile?.firstName ?? ""} ${order.user?.profile?.lastName ?? ""}`.trim();
                const date = new Date(order.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                );
                const totalItems = order.items.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-text-muted">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-main">
                        {customerName || "Customer"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">
                      {date}
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-bold text-text-main">
                      ৳{Number(order.total).toFixed(2)}
                    </td>
                    {/* Payment Status — clickable to open popup */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setPaymentOrder(order);
                          setSelectedPaymentStatus(order.paymentStatus);
                        }}
                        title="Update payment status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:opacity-80 cursor-pointer ${pm.color}`}
                      >
                        <CreditCard className="h-3 w-3" />
                        {pm.label}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </td>
                    {/* Order Status Dropdown */}
                    <td className="px-6 py-4">
                      <div
                        className="relative"
                        ref={openDropdown === order.id ? dropdownRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === order.id ? null : order.id,
                            )
                          }
                          disabled={updatingId === order.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${sm.color} hover:opacity-80`}
                        >
                          {updatingId === order.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            sm.icon
                          )}
                          {sm.label}
                          <ChevronDown className="h-3 w-3" />
                        </button>

                        {openDropdown === order.id && (
                          <div className="absolute top-full left-0 mt-1 w-40 bg-surface border border-border-main rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            {ORDER_STATUSES.map((s) => {
                              const meta = STATUS_META[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-zinc-50 transition-colors cursor-pointer text-left ${order.status === s ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                  <span
                                    className={`p-1 rounded-full ${meta.color}`}
                                  >
                                    {meta.icon}
                                  </span>
                                  {meta.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-text-muted hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-background border-t border-border-main">
          <p className="text-xs text-text-muted">
            Showing {filtered.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* Payment Status Popup */}
      {paymentOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={paymentModalRef}
            className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-text-muted" />
                <div>
                  <h3 className="font-bold text-text-main">
                    Update Payment Status
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Order #{paymentOrder.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentOrder(null)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-text-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-4">
                Select Payment Status
              </p>
              {PAYMENT_STATUSES.map((status) => {
                const meta = PAYMENT_META[status];
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedPaymentStatus(status)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      selectedPaymentStatus === status
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-border-main hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    <span className="font-medium text-sm text-text-main">
                      {meta.label}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </button>
                );
              })}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setPaymentOrder(null)}
                  className="flex-1 px-4 py-2.5 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePaymentStatus}
                  disabled={
                    updatingPayment ||
                    selectedPaymentStatus === paymentOrder.paymentStatus
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {updatingPayment && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border-main shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border-main bg-background flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-text-main">
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-text-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Customer */}
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                  Customer
                </p>
                <p className="font-medium text-text-main">
                  {`${selectedOrder.user?.profile?.firstName ?? ""} ${selectedOrder.user?.profile?.lastName ?? ""}`.trim() ||
                    "Customer"}
                </p>
                <p className="text-sm text-text-muted">
                  {selectedOrder.user?.email}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_META[selectedOrder.status]?.color}`}
                  >
                    {STATUS_META[selectedOrder.status]?.icon}
                    {STATUS_META[selectedOrder.status]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Payment
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${PAYMENT_META[selectedOrder.paymentStatus]?.color}`}
                  >
                    {PAYMENT_META[selectedOrder.paymentStatus]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Fulfillment
                  </p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                    {selectedOrder.fulfillmentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                  Items
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-main"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-main">
                          {item.variant?.product?.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          SKU: {item.variant?.sku} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-text-main">
                        ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div className="border-t border-border-main pt-4 space-y-2">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Subtotal</span>
                  <span>৳{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(selectedOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>
                      -৳{Number(selectedOrder.discountAmount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Shipping</span>
                  <span>
                    ৳{parseFloat(selectedOrder.shippingFee).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-text-main border-t border-border-main pt-2">
                  <span>Total</span>
                  <span>৳{parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
