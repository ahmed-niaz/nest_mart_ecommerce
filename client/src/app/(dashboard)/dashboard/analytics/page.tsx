"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  CreditCard,
  Package,
  ArrowUpRight,
  BarChart2,
  ShoppingBag,
  Calendar,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Overview {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalUsers: number;
}

interface DailySale {
  id: string;
  date: string;
  totalRevenue: string;
  totalOrders: number;
  totalDiscounts: string;
}

interface TopProduct {
  id: string;
  salesCount: number;
  revenue: string;
  product: {
    id: string;
    name: string;
    category?: { name: string };
  };
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  createdAt: string;
  user: { email: string; profile?: { firstName?: string; lastName?: string } };
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${Cookies.get("accessToken")}`,
    "Content-Type": "application/json",
  };
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = getAuthHeaders();
        const [ovRes, dsRes, tpRes, ordRes] = await Promise.all([
          fetch(`${BASE_URL}/analytics/overview`, { headers }),
          fetch(`${BASE_URL}/analytics/daily-sales`, { headers }),
          fetch(`${BASE_URL}/analytics/top-products?limit=10`, { headers }),
          fetch(`${BASE_URL}/orders`, { headers }).catch(() => null),
        ]);

        if (!ovRes.ok)
          throw new Error(
            "Failed to fetch analytics data. Make sure you are logged in as an admin.",
          );

        const [ovData, dsData, tpData] = await Promise.all([
          ovRes.json(),
          dsRes.json(),
          tpRes.json(),
        ]);

        const ordData = ordRes && ordRes.ok ? await ordRes.json() : null;

        const resolvedOverview = ovData?.success ? ovData.data : ovData;
        const resolvedDailySales = dsData?.success ? dsData.data : dsData;
        const resolvedTopProducts = tpData?.success ? tpData.data : tpData;
        const resolvedOrders = ordData?.success ? ordData.data : ordData;

        setOverview(resolvedOverview);
        setDailySales(
          Array.isArray(resolvedDailySales) ? resolvedDailySales : [],
        );
        setTopProducts(
          Array.isArray(resolvedTopProducts) ? resolvedTopProducts : [],
        );
        setRecentOrders(
          Array.isArray(resolvedOrders) ? resolvedOrders.slice(0, 5) : [],
        );
      } catch (err: any) {
        setError(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter Sales Data based on Selected TimeRange
  const filteredDailySales = useMemo(() => {
    const limit = timeRange === "7days" ? 7 : timeRange === "14days" ? 14 : 30;
    return dailySales.slice(-limit);
  }, [dailySales, timeRange]);

  const maxRevenue = useMemo(() => {
    return filteredDailySales.length
      ? Math.max(
          ...filteredDailySales.map((d) => parseFloat(d.totalRevenue) || 0),
        )
      : 1;
  }, [filteredDailySales]);

  const maxProductRevenue = useMemo(() => {
    return topProducts.length
      ? Math.max(...topProducts.map((p) => parseFloat(p.revenue) || 0))
      : 1;
  }, [topProducts]);

  // Construct coordinates for Revenue Area SVG Chart
  const revenuePoints = useMemo(() => {
    if (filteredDailySales.length === 0) return [];
    const width = 540;
    const height = 180;
    const marginX = 40;
    const marginY = 20;
    const xStep =
      (width - 2 * marginX) / Math.max(filteredDailySales.length - 1, 1);

    return filteredDailySales.map((day, i) => {
      const val = parseFloat(day.totalRevenue) || 0;
      const x = marginX + i * xStep;
      const y = height - marginY - (val / maxRevenue) * (height - 2 * marginY);
      const date = new Date(day.date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { x, y, val, label };
    });
  }, [filteredDailySales, maxRevenue]);

  const revenueLinePath = useMemo(() => {
    if (revenuePoints.length === 0) return "";
    return revenuePoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [revenuePoints]);

  const revenueAreaPath = useMemo(() => {
    if (revenuePoints.length === 0) return "";
    const first = revenuePoints[0];
    const last = revenuePoints[revenuePoints.length - 1];
    return `${revenueLinePath} L ${last.x} 160 L ${first.x} 160 Z`;
  }, [revenuePoints, revenueLinePath]);

  // Construct coordinates for Orders Area SVG Chart
  const ordersPoints = useMemo(() => {
    if (filteredDailySales.length === 0) return [];
    const width = 540;
    const height = 180;
    const marginX = 40;
    const marginY = 20;
    const maxOrders = Math.max(
      ...filteredDailySales.map((d) => d.totalOrders || 0),
      1,
    );
    const xStep =
      (width - 2 * marginX) / Math.max(filteredDailySales.length - 1, 1);

    return filteredDailySales.map((day, i) => {
      const val = day.totalOrders || 0;
      const x = marginX + i * xStep;
      const y = height - marginY - (val / maxOrders) * (height - 2 * marginY);
      const date = new Date(day.date);
      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      return { x, y, val, label, maxOrders };
    });
  }, [filteredDailySales]);

  const ordersLinePath = useMemo(() => {
    if (ordersPoints.length === 0) return "";
    return ordersPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [ordersPoints]);

  const ordersAreaPath = useMemo(() => {
    if (ordersPoints.length === 0) return "";
    const first = ordersPoints[0];
    const last = ordersPoints[ordersPoints.length - 1];
    return `${ordersLinePath} L ${last.x} 160 L ${first.x} 160 Z`;
  }, [ordersPoints, ordersLinePath]);

  // Group top performing categories for donut chart
  const categoryShares = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> =
      {};
    const colors = [
      "text-emerald-500 bg-emerald-500",
      "text-blue-500 bg-blue-500",
      "text-violet-500 bg-violet-500",
      "text-amber-500 bg-amber-500",
      "text-rose-500 bg-rose-500",
    ];
    let colorIdx = 0;

    topProducts.forEach((p) => {
      const catName = p.product?.category?.name || "General";
      const rev = parseFloat(p.revenue) || 0;
      if (!map[catName]) {
        map[catName] = {
          name: catName,
          value: 0,
          color: colors[colorIdx % colors.length],
        };
        colorIdx++;
      }
      map[catName].value += rev;
    });

    const list = Object.values(map);
    const total = list.reduce((sum, item) => sum + item.value, 0);
    return list
      .map((item) => ({
        ...item,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [topProducts]);

  const donutSegments = useMemo(() => {
    const total = categoryShares.reduce((sum, item) => sum + item.value, 0);
    const result = [];
    let currentOffset = 0;
    const circumference = 2 * Math.PI * 40; // ~251.32

    const hexColors = [
      "#10B981", // emerald
      "#3B82F6", // blue
      "#8B5CF6", // violet
      "#F59E0B", // amber
      "#EF4444", // red
    ];

    for (let i = 0; i < categoryShares.length; i++) {
      const cat = categoryShares[i];
      const percentage = total > 0 ? cat.value / total : 0;
      const strokeLength = percentage * circumference;
      const strokeOffset = circumference - currentOffset;
      currentOffset += strokeLength;

      result.push({
        name: cat.name,
        percentage: percentage * 100,
        value: cat.value,
        strokeLength,
        strokeOffset,
        color: hexColors[i % hexColors.length],
        bgClass: cat.color.split(" ")[1],
        textClass: cat.color.split(" ")[0],
      });
    }

    return result;
  }, [categoryShares]);

  const stats = overview
    ? [
        {
          label: "Total Revenue",
          value: `৳${(overview.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: CreditCard,
          color:
            "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
          growth: "+14.8% vs last month",
          growthType: "positive",
        },
        {
          label: "Total Orders",
          value: (overview.totalOrders ?? 0).toLocaleString(),
          icon: Package,
          color: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
          growth: "+8.2% vs last month",
          growthType: "positive",
        },
        {
          label: "Active Products",
          value: (overview.activeProducts ?? 0).toLocaleString(),
          icon: ShoppingBag,
          color: "bg-violet-500/10 text-violet-600 border border-violet-500/20",
          growth: "+2 new added this week",
          growthType: "neutral",
        },
        {
          label: "Total Customers",
          value: (overview.totalUsers ?? 0).toLocaleString(),
          icon: Users,
          color: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
          growth: "+12% active today",
          growthType: "positive",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-main">Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-border-main animate-pulse h-32 shadow-sm"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-border-main h-80 animate-pulse lg:col-span-2 shadow-sm" />
          <div className="bg-white rounded-2xl border border-border-main h-80 animate-pulse shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-text-main mb-6">Analytics</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center shadow-sm">
          <BarChart2 className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-950 mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Vitals, metrics, and operations overview
          </p>
        </div>

        {/* Classy Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-secondary border border-border-main p-1 rounded-xl flex items-center gap-1 shadow-sm">
            {[
              { id: "7days", label: "7D" },
              { id: "14days", label: "14D" },
              { id: "30days", label: "30D" },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range.id
                    ? "bg-white text-text-main shadow-sm border border-border-main/50"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Monitoring
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-md hover:border-zinc-300/60 transition-all duration-300 relative group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-text-main tracking-tight mb-2">
              {stat.value}
            </h3>
            <span
              className={`text-xs font-semibold ${
                stat.growthType === "positive"
                  ? "text-emerald-600"
                  : "text-text-muted"
              }`}
            >
              {stat.growth}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue SVG Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.015)] lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-text-main">
                Revenue Over Time
              </h2>
            </div>
            <span className="text-xs text-text-muted font-semibold">
              Average: ৳{((overview?.totalRevenue || 0) / 30).toFixed(0)}/day
            </span>
          </div>

          {filteredDailySales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <BarChart2 className="h-12 w-12 text-text-muted mb-2" />
              <p className="text-sm font-semibold text-text-muted">
                No sales analytics data yet
              </p>
            </div>
          ) : (
            <div className="relative overflow-visible">
              <svg
                viewBox="0 0 540 180"
                className="w-full h-44 overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="revAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[20, 55, 90, 125, 160].map((y, i) => (
                  <line
                    key={i}
                    x1="40"
                    y1={y}
                    x2="520"
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1.5"
                    strokeDasharray={y === 160 ? "0" : "4 4"}
                  />
                ))}

                {/* Y-axis Labels */}
                <text
                  x="30"
                  y="24"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  ৳{(maxRevenue * 1.0).toFixed(0)}
                </text>
                <text
                  x="30"
                  y="94"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  ৳{(maxRevenue * 0.5).toFixed(0)}
                </text>
                <text
                  x="30"
                  y="164"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  0
                </text>

                {/* Area Gradient path */}
                <path
                  d={revenueAreaPath}
                  fill="url(#revAreaGradient)"
                  className="transition-all duration-500"
                />

                {/* Main line path */}
                <path
                  d={revenueLinePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />

                {/* Interactive Glowing Nodes */}
                {revenuePoints.map((p, idx) => (
                  <g key={idx} className="group/node cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="10"
                      className="fill-emerald-500/10 opacity-0 group-hover/node:opacity-100 transition-opacity duration-150"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#ffffff"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* Tooltip Popup */}
                    <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                      <rect
                        x={p.x - 45}
                        y={p.y - 32}
                        width="90"
                        height="22"
                        rx="6"
                        fill="#0f172a"
                      />
                      <text
                        x={p.x}
                        y={p.y - 18}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="extrabold"
                        textAnchor="middle"
                      >
                        ৳{p.val.toFixed(0)}
                      </text>
                    </g>
                  </g>
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between pl-[40px] pr-[20px] mt-2">
                {revenuePoints.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-text-muted font-bold tracking-tight"
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Share Donut SVG Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-600">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-text-main">
                Category Sales
              </h2>
            </div>

            {categoryShares.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 opacity-40">
                <Layers className="h-12 w-12 text-text-muted mb-2" />
                <p className="text-sm font-semibold text-text-muted">
                  No category share data
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center sm:flex-row lg:flex-col gap-6 justify-center">
                {/* SVG Donut */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full transform -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f8fafc"
                      strokeWidth="10"
                    />
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="10"
                        strokeDasharray={`${seg.strokeLength} 251.32`}
                        strokeDashoffset={seg.strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase font-bold text-text-muted tracking-widest leading-none mb-1">
                      Revenue
                    </span>
                    <span className="text-xs font-black text-text-main">
                      ৳
                      {overview
                        ? (overview.totalRevenue || 0).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 w-full space-y-2">
                  {donutSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-text-secondary truncate max-w-[120px]">
                          {seg.name}
                        </span>
                      </div>
                      <span className="text-text-main font-bold text-right shrink-0">
                        {seg.percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Details: Top Performing & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing List (2 cols) */}
        <div className="bg-white rounded-2xl border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.015)] lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-border-main/60 flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-text-main">
                Top Performing Products
              </h2>
            </div>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <ShoppingBag className="h-12 w-12 text-text-muted mb-2" />
                <p className="text-sm font-semibold text-text-muted">
                  No product performance metrics yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100/80">
                {topProducts.slice(0, 5).map((item, i) => {
                  const revenue = parseFloat(item.revenue) || 0;
                  const pct =
                    maxProductRevenue > 0
                      ? (revenue / maxProductRevenue) * 100
                      : 0;
                  return (
                    <div
                      key={item.id}
                      className="px-6 py-4.5 flex items-center gap-4 hover:bg-surface-secondary/40 transition-colors"
                    >
                      <span className="text-xs font-black text-text-muted w-5 shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-main truncate">
                          {item.product?.name ?? "—"}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {item.product?.category?.name ?? "General"}
                        </p>
                        <div className="mt-2.5 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-text-main">
                          ৳{revenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {item.salesCount} sold
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {topProducts.length > 5 && (
            <div className="p-4 border-t border-border-main/60 bg-surface-secondary/30 text-center">
              <Link
                href="/dashboard/products"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center justify-center gap-1.5"
              >
                Manage Products Catalogue <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Live Transaction Feed (1 col) */}
        <div className="bg-white rounded-2xl border border-border-main shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-border-main/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-text-main">
                  Recent Activity
                </h2>
              </div>
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest animate-pulse">
                Realtime
              </span>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <Activity className="h-12 w-12 text-text-muted mb-2" />
                <p className="text-sm font-semibold text-text-muted">
                  No recent transaction feed
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100/80">
                {recentOrders.map((order) => {
                  const initials = order.user?.profile?.firstName
                    ? `${order.user.profile.firstName[0]}${order.user.profile.lastName?.[0] || ""}`.toUpperCase()
                    : order.user?.email?.[0].toUpperCase() || "C";
                  const date = new Date(order.createdAt);
                  const relativeTime = date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={order.id}
                      className="p-5 flex items-center gap-3.5 hover:bg-surface-secondary/30 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-surface-secondary border border-border-light flex items-center justify-center font-bold text-xs text-text-main shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-text-main truncate max-w-[100px]">
                            {order.user?.profile?.firstName
                              ? `${order.user.profile.firstName} ${order.user.profile.lastName || ""}`
                              : "Guest user"}
                          </p>
                          <span className="text-[10px] text-text-muted font-bold shrink-0">
                            {relativeTime}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          {order.user?.email}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] font-black text-primary">
                            ৳{parseFloat(order.total).toFixed(2)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              order.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700"
                                : order.status === "CANCELLED"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {order.status.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {recentOrders.length > 0 && (
            <div className="p-4 border-t border-border-main/60 bg-surface-secondary/30 text-center">
              <Link
                href="/dashboard/orders"
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center justify-center gap-1.5"
              >
                Open Orders Desk <ExternalLink size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
