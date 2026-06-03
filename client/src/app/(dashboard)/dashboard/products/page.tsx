"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  status: string;
  quantity: number;
  price: string;
  vendorName: string;
  images: string[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch for now, will connect to API later
    const fetchProducts = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/products`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Products</h1>
          <p className="text-text-muted text-sm">
            Manage your inventory and product listings.
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md relative">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Filter products..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-border-main text-[#95FF00] focus:ring-[#95FF00]"
                />
              </th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Inventory</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={6}>
                    <div className="h-8 bg-background rounded"></div>
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center" colSpan={6}>
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                    <Package className="h-12 w-12" />
                    <p className="font-medium">No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const img = product.images?.[0];
                const imgUrl = img
                  ? typeof img === "string"
                    ? img
                    : (img as any).url
                  : null;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if they clicked the checkbox or the action menu
                      const target = e.target as HTMLElement;
                      if (
                        !target.closest('input[type="checkbox"]') &&
                        !target.closest("a")
                      ) {
                        router.push(`/products/${product.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-border-main text-text-main focus:ring-zinc-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-background rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-border-main">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-text-muted" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main group-hover:text-black transition-colors">
                            {product.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {product.vendorName || "No Vendor"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-background text-text-muted"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className={`text-sm font-medium ${product.quantity === 0 ? "text-red-500" : "text-zinc-700"}`}
                      >
                        {product.quantity} in stock
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-text-main">
                        ৳{product.price}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="inline-flex p-2 text-text-muted hover:text-black hover:bg-zinc-100 rounded-full transition-all"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-background border-t border-border-main flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {products.length} products
          </p>
          <div className="flex space-x-1">
            <button
              className="p-2 text-text-muted hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-text-muted hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-30"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
