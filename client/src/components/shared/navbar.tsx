"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter, useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name?: string;
  title?: string;
  slug: string;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/categories`);
        const data = await res.json();
        if (data.success && data.data) {
          const nameMap = new Map<string, Category & { productCount?: number }>();
          data.data.forEach((cat: any) => {
            const name = (cat.name || cat.title || "").trim();
            const lowerName = name.toLowerCase();
            const slug = (cat.slug || "").toLowerCase();

            if (
              lowerName.includes("honey & functional foods") ||
              lowerName.includes("duplicate") ||
              slug.includes("honey-functional-foods")
            ) {
              return;
            }

            const existing = nameMap.get(lowerName);
            if (!existing || (cat.productCount || 0) > (existing.productCount || 0)) {
              nameMap.set(lowerName, cat);
            }
          });
          setCategories(Array.from(nameMap.values()));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">N</span>
            </div>
            <span className="text-lg font-bold text-text-main tracking-tight">
              NestMart
            </span>
          </Link>

          {/* Navigation Links — Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-main rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-main rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Products
            </Link>
          </nav>

          {/* Search — Desktop */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm mx-6 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-surface-secondary border border-border-light rounded-lg text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border-main rounded-xl shadow-lg z-50 animate-slide-down overflow-hidden">
                      <div className="p-3 border-b border-border-light">
                        <p className="text-sm font-semibold text-text-main truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-text-muted capitalize mt-0.5">
                          {user.role.toLowerCase().replace("_", " ")}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-3 py-2 text-sm text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
                        >
                          My Profile
                        </Link>
                        {user.role === "CUSTOMER" && (
                          <Link
                            href="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-3 py-2 text-sm text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
                          >
                            My Orders
                          </Link>
                        )}
                        {["ADMIN", "SUPER_ADMIN", "STAFF"].includes(
                          user.role.toUpperCase(),
                        ) && (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-3 py-2 text-sm text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
                          >
                            Dashboard
                          </Link>
                        )}
                        <div className="my-1 border-t border-border-light" />
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-error hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-main rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-light animate-slide-down">
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-surface-secondary border border-border-light rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </form>
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-main hover:bg-surface-secondary rounded-lg transition-colors"
              >
                Products
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Subnav for Categories (Etsy-style) */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-8 px-4 py-3 border-t border-border-main bg-white">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="text-sm font-semibold text-text-main hover:text-primary transition-colors"
          >
            {cat.name || cat.title}
          </Link>
        ))}
      </div>
    </header>
  );
}
