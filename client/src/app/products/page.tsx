"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  Loader2,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // Sync search input with URL search parameters when they change
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    setSearchInput(q);
    setDebouncedSearch(q);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, sort, debouncedSearch]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only set debouncedSearch if searchInput has changed from debouncedSearch
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", category, page, sort, debouncedSearch],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const params = new URLSearchParams({ _pagination: "true" });
      if (category) params.append("category", category);
      if (page > 1) params.append("page", page.toString());
      if (sort && sort !== "newest") params.append("sort", sort);
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "12");

      const res = await fetch(`${baseUrl}/products?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error("Failed to fetch products");
      return json.data; // Expected: { products, total, page, limit }
    },
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 12);

  const displayCategoryName =
    category && products.length > 0
      ? products[0].category?.name
      : category
        ? category
            .split("-")
            .slice(0, 2)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {category ? `Products in "${displayCategoryName}"` : "All Products"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              className="bg-white border border-gray-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-primary outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="min-h-[40vh] flex items-center justify-center text-red-500">
          Error loading products.
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <ShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            No products found matching your criteria.
          </p>
          {(searchInput || sort !== "newest") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput("");
                setSort("newest");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px]">
            {products.map((product: any) => {
              const defaultImage = product.images?.[0]?.url || "";
              const isOutOfStock = product.quantity <= 0;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border-main hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
                  >
                    {defaultImage ? (
                      <img
                        src={defaultImage}
                        alt={product.title}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="bg-white text-gray-900 font-bold px-3 py-1 text-sm rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="block flex-1"
                    >
                      <h3 className="text-gray-900 font-bold mb-1 line-clamp-2 hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-primary">
                          ৳{Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
