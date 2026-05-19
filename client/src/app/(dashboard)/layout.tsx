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
      { label: "Collections", href: "/dashboard/collections" },
      { label: "Inventory", href: "/dashboard/inventory" },
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
    <div className="flex h-screen bg-[#F1F1F1] font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Store className="h-6 w-6 text-zinc-100" />
          {isSidebarOpen && (
            <span className="ml-3 font-bold text-lg tracking-tight">NestMart</span>
          )}
        </div>

        {/* Links Section */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.subItems && pathname.startsWith(link.href)) ||
              (link.subItems && link.subItems.some((sub) => pathname.startsWith(sub.href)));

            return (
              <div key={link.href} className="space-y-1">
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-colors group",
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-text-muted hover:bg-white/5 hover:text-white"
                  )}
                >
                  <link.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "group-hover:text-white"
                    )}
                  />
                  {isSidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{link.label}</span>
                  )}
                  {isSidebarOpen && link.subItems && (
                    <ChevronRight
                      className={cn(
                        "ml-auto h-4 w-4 text-text-muted transition-transform duration-200",
                        isActive && "rotate-90"
                      )}
                    />
                  )}
                </Link>
                {isSidebarOpen && link.subItems && isActive && (
                  <div className="pl-9 space-y-1 border-l border-white/10 ml-5">
                    {link.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-[13px] transition-colors",
                            isSubActive
                              ? "bg-white/5 text-white font-semibold"
                              : "text-text-muted hover:text-white hover:bg-white/5"
                          )}
                        >
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
        <div className="p-3 border-t border-white/10">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-3 py-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5"
          >
            <Settings className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border-main flex items-center justify-between px-8 shadow-sm relative z-10">
          <div className="flex items-center flex-1 max-w-xl relative">
            <Search className="absolute left-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-background border-none rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-text-muted hover:bg-zinc-100 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm hover:bg-primary-hover transition-colors focus:outline-none"
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border-main overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-border-main">
                    <p className="text-sm font-bold text-text-main">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Store User'}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-background text-zinc-700 uppercase tracking-widest">
                      {user?.role?.replace('_', ' ') || 'CUSTOMER'}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
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
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
