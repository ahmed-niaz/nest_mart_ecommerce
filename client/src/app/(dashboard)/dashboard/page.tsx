"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  CreditCard,
  Package,
  ArrowUpRight,
  ShoppingCart,
  BarChart2,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Overview {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalUsers: number;
}

interface Collection {
  id: string;
  title: string;
  productCount: number;
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${Cookies.get("accessToken")}`,
    "Content-Type": "application/json",
  };
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    // Fetch analytics overview (requires admin auth)
    fetch(`${BASE_URL}/analytics/overview`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const actualData = data?.success ? data.data : data;
        if (actualData && typeof actualData.totalRevenue !== "undefined") {
          setOverview(actualData);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOverview(false));

    // Fetch collections (public endpoint)
    fetch(`${BASE_URL}/collections`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCollections(data.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingCollections(false));
  }, []);

  const stats = overview
    ? [
        {
          label: "Total Revenue",
          value: `৳${(overview.totalRevenue || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          icon: CreditCard,
          href: "/dashboard/analytics",
          badgeColor: "bg-emerald-100 text-emerald-700",
        },
        {
          label: "Total Orders",
          value: (overview.totalOrders ?? 0).toLocaleString(),
          icon: ShoppingCart,
          href: "/dashboard/orders",
          badgeColor: "bg-blue-100 text-blue-700",
        },
        {
          label: "Active Products",
          value: (overview.activeProducts ?? 0).toLocaleString(),
          icon: Package,
          href: "/dashboard/products",
          badgeColor: "bg-violet-100 text-violet-700",
        },
        {
          label: "Total Customers",
          value: (overview.totalUsers ?? 0).toLocaleString(),
          icon: Users,
          href: "/dashboard/customers",
          badgeColor: "bg-amber-100 text-amber-700",
        },
      ]
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            Welcome back — here's your store at a glance.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
          >
            <BarChart2 className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingOverview ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface p-6 rounded-xl border border-border-main shadow-sm animate-pulse h-28"
            />
          ))
        ) : overview && stats ? (
          stats.map((stat, idx) => (
            <Link
              href={stat.href}
              key={idx}
              className="bg-surface p-6 rounded-xl border border-border-main shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-2.5 rounded-lg ${stat.badgeColor.split(" ")[0]}`}
                >
                  <stat.icon
                    className={`h-5 w-5 ${stat.badgeColor.split(" ")[1]}`}
                  />
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-muted group-hover:text-text-main transition-colors" />
              </div>
              <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-text-main">{stat.value}</p>
            </Link>
          ))
        ) : (
          // Fallback: analytics endpoint unavailable (not admin)
          <div className="col-span-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 shrink-0" />
            Analytics data could not be loaded. Make sure you are logged in as
            an admin.
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Manage Orders",
            desc: "View & update all customer orders",
            href: "/dashboard/orders",
            icon: ShoppingCart,
            color: "text-blue-600",
          },
          {
            label: "Inventory",
            desc: "Check stock levels & movements",
            href: "/dashboard/inventory",
            icon: Package,
            color: "text-violet-600",
          },
          {
            label: "View Storefront",
            desc: "Preview the live customer store",
            href: "/",
            icon: ExternalLink,
            color: "text-emerald-600",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:shadow-md transition-all group flex items-center gap-4 cursor-pointer"
          >
            <div
              className={`p-3 bg-background rounded-xl group-hover:bg-zinc-200 transition-colors ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-text-main text-sm">{item.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-text-muted ml-auto shrink-0 group-hover:text-text-main transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Collections */}
      <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-text-muted" />
            <h2 className="text-base font-bold text-text-main">Collections</h2>
          </div>
          <Link
            href="/dashboard/categories"
            className="text-xs font-bold text-primary hover:text-primary-hover hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            View All
          </Link>
        </div>

        {loadingCollections ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-background rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30">
            <FolderOpen className="h-10 w-10 text-text-muted mb-2" />
            <p className="text-sm text-text-muted">No collections yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-main text-text-muted text-xs uppercase font-bold tracking-widest">
                  <th className="py-3 pr-6">Collection Name</th>
                  <th className="py-3 pr-6">Status</th>
                  <th className="py-3 pr-6">Products</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {collections.map((col) => (
                  <tr
                    key={col.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="py-3 pr-6 font-medium text-text-main">
                      {col.title}
                    </td>
                    <td className="py-3 pr-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-text-muted">
                      {col.productCount ?? 0}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/dashboard/products?collection=${col.id}`}
                        className="text-xs font-bold text-primary hover:text-primary-hover hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
