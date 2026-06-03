"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Tag,
  Settings,
  Search,
  Bell,
  Store,
  ExternalLink,
  LogOut,
  User as UserIcon,
  ChevronRight,
  FolderOpen,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const sidebarLinks = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
    subItems: [
      { label: "Categories", href: "/dashboard/categories", icon: FolderOpen },
      { label: "Inventory", href: "/dashboard/inventory", icon: ClipboardList },
    ],
  },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Discounts", href: "/dashboard/discounts", icon: Tag },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-surface-secondary font-sans p-4 gap-4">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white/80 backdrop-blur-md border border-border-main rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 flex flex-col overflow-hidden",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-5 border-b border-border-main/60 bg-gradient-to-b from-white/40 to-transparent">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Store className="h-4 w-4 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-sm tracking-tight bg-gradient-to-r from-text-main to-text-secondary bg-clip-text text-transparent truncate">
              NestMart Admin
            </span>
          )}
        </div>

        {/* Links Section */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.subItems && pathname.startsWith(link.href)) ||
              (link.subItems &&
                link.subItems.some((sub) => pathname.startsWith(sub.href)));

            return (
              <div key={link.href} className="space-y-1">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-transparent text-primary font-semibold"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-main",
                  )}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <link.icon
                    className={cn(
                      "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text-main",
                    )}
                  />
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium tracking-tight">
                      {link.label}
                    </span>
                  )}
                  {isSidebarOpen && link.subItems && (
                    <ChevronRight
                      className={cn(
                        "ml-auto h-4 w-4 text-text-muted transition-transform duration-200",
                        isActive && "rotate-90 text-primary",
                      )}
                    />
                  )}
                </Link>
                {isSidebarOpen && link.subItems && isActive && (
                  <div className="pl-4 space-y-1 border-l border-border-main/60 ml-5.5 py-1">
                    {link.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "flex items-center px-3 py-1.5 rounded-lg text-[13px] transition-all duration-150 group/sub",
                            isSubActive
                              ? "bg-primary/5 text-primary font-semibold"
                              : "text-text-secondary hover:text-text-main hover:bg-surface-secondary",
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              className={cn(
                                "h-3.5 w-3.5 mr-2 shrink-0 transition-transform duration-150 group-hover/sub:scale-105",
                                isSubActive
                                  ? "text-primary"
                                  : "text-text-muted group-hover/sub:text-text-main",
                              )}
                            />
                          )}
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border-main/60">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-3.5 py-2.5 text-text-secondary hover:text-text-main rounded-xl hover:bg-surface-secondary"
          >
            <Settings className="h-[18px] w-[18px] text-text-muted" />
            {isSidebarOpen && (
              <span className="ml-3 text-sm font-medium tracking-tight">
                Settings
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border border-border-main rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border-main/60 flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center flex-1 max-w-md relative group">
            <Search className="absolute left-3.5 h-4 w-4 text-text-muted transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border-light rounded-xl text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-text-muted hover:text-text-main hover:bg-surface-secondary rounded-xl relative transition-all">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all focus:outline-none"
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : "U"}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border-main overflow-hidden py-1 z-50 animate-slide-down">
                  <div className="px-4 py-3 border-b border-border-main/60">
                    <p className="text-sm font-bold text-text-main">
                      {user?.firstName
                        ? `${user.firstName} ${user.lastName || ""}`
                        : "Store User"}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-secondary text-zinc-700 uppercase tracking-widest">
                      {user?.role?.replace("_", " ") || "CUSTOMER"}
                    </div>
                  </div>

                  <div className="py-1">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-surface-secondary hover:text-text-main transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-3 text-text-muted" />
                      Preview Store
                    </a>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </div>
  );
}
