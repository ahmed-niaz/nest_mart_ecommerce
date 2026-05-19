"use client";

import React from "react";
import {
  TrendingUp,
  Users,
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Sales",
    value: "$12,450.00",
    change: "+12.5%",
    isPositive: true,
    icon: CreditCard,
  },
  {
    label: "Total Orders",
    value: "456",
    change: "+5.2%",
    isPositive: true,
    icon: Package,
  },
  {
    label: "Total Customers",
    value: "1,234",
    change: "-2.4%",
    isPositive: false,
    icon: Users,
  },
  {
    label: "Average Order Value",
    value: "$27.30",
    change: "+8.1%",
    isPositive: true,
    icon: TrendingUp,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Dashboard</h1>
          <p className="text-text-muted text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
            Manage Store
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-surface p-6 rounded-xl border border-border-main shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-background rounded-lg group-hover:bg-zinc-200 transition-colors">
                <stat.icon className="h-5 w-5 text-zinc-600 group-hover:text-black transition-colors" />
              </div>
              <div
                className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                  stat.isPositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stat.change}
                {stat.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 ml-1" />
                )}
              </div>
            </div>
            <div>
              <p className="text-text-muted text-xs font-medium uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-text-main">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Tables Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-8 rounded-xl border border-border-main shadow-sm h-96 flex flex-col items-center justify-center text-text-muted space-y-4">
          <TrendingUp className="h-12 w-12 opacity-20" />
          <p className="font-medium">Sales Overview Chart (Coming Soon)</p>
        </div>
        <div className="bg-surface p-8 rounded-xl border border-border-main shadow-sm h-96 flex flex-col items-center justify-center text-text-muted space-y-4">
          <Users className="h-12 w-12 opacity-20" />
          <p className="font-medium text-center px-4">Top Customers (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
