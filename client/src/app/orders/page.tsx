"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/lib/auth-context";

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
    stock: number;
    product: {
      name: string;
      images?: { url: string }[];
    };
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
  items: OrderItem[];
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock className="h-4 w-4" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-700",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-violet-100 text-violet-700",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="h-4 w-4" />,
  },
  RETURNED: {
    label: "Returned",
    color: "bg-zinc-100 text-zinc-600",
    icon: <RefreshCw className="h-4 w-4" />,
  },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { label: string; color: string }> =
  {
    PENDING: { label: "Unpaid", color: "bg-amber-100 text-amber-700" },
    COMPLETED: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
    FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-700" },
    REFUNDED: { label: "Refunded", color: "bg-zinc-100 text-zinc-600" },
  };

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const paymentCfg =
    PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.PENDING;

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Order</p>
            <p className="font-black text-gray-900 text-sm font-mono">
              #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-100" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-semibold text-gray-700">{date}</p>
          </div>
          <div className="hidden sm:block h-8 w-px bg-gray-100" />
          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Items</p>
            <p className="text-sm font-semibold text-gray-700">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.color}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>

          {/* Payment Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${paymentCfg.color}`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            {paymentCfg.label}
          </span>

          {/* Total */}
          <span className="text-lg font-black text-gray-900 ml-2">
            ৳{Number(order.total).toFixed(2)}
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ml-1"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Items */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Items List */}
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => {
              const imageUrl = item.variant?.product?.images?.[0]?.url ?? null;
              const itemTotal = parseFloat(item.price) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="px-5 sm:px-6 py-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.variant?.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {item.variant?.product?.name ?? "Product"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      SKU: {item.variant?.sku}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} × ৳{Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-gray-900">
                      ৳{itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 px-5 sm:px-6 py-4 space-y-2 border-t border-gray-100">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>৳{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>−৳{Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>
                {parseFloat(order.shippingFee) === 0 ? (
                  <span className="text-emerald-600 font-bold">Free</span>
                ) : (
                  `৳{Number(order.shippingFee).toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>৳{parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to load your orders.");
        const data = await res.json();
        const resolved = data?.success ? data.data : data;
        setOrders(Array.isArray(resolved) ? resolved : []);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Sign in to view orders
        </h2>
        <p className="text-gray-500 mb-6">
          You need to be logged in to see your order history.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length > 0
                ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
                : "Your order history"}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-orange-200" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              You haven&apos;t placed any orders yet. Start shopping to see your
              orders here.
            </p>
            <Link
              href="/"
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-orange-100 cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
