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
  Loader2,
  X,
  PlusCircle,
  FolderMinus,
  ArrowLeft,
  FolderOpen,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

interface Product {
  id: string;
  title: string;
  status: string;
  quantity: number;
  price: string;
  vendorName: string;
  images: string[];
  categoryId: string;
  category?: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted">Loading products page...</p>
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states for adding product to category
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allAvailableProducts, setAllAvailableProducts] = useState<Product[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      let url = `${baseUrl}/products`;
      if (categoryId) {
        url = `${baseUrl}/products?category=${categoryId}`;
      }
      
      const res = await fetch(url);
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

  const fetchCategoryDetail = async () => {
    if (!categoryId) {
      setCategoryName("");
      return;
    }
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/categories/${categoryId}`);
      const data = await res.json();
      if (data.success || res.ok) {
        const cat = data.data || data;
        setCategoryName(cat.name || cat.title || "Category");
      }
    } catch (error) {
      console.error("Failed to fetch category detail:", error);
      setCategoryName("Category");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoryDetail();
  }, [categoryId]);

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    setLoadingAvailable(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/products`);
      const data = await res.json();
      if (data.success) {
        // filter out products that are already in this category
        const filtered = data.data.filter(
          (p: Product) => p.categoryId !== categoryId
        );
        setAllAvailableProducts(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch all products for modal:", error);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddProductToCategory = async (productId: string) => {
    if (!categoryId) return;
    setAddingProductId(productId);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      const token = Cookies.get("accessToken");
      const res = await fetch(`${baseUrl}/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId }),
      });
      
      if (res.ok) {
        // Remove from modal list
        setAllAvailableProducts(prev => prev.filter(p => p.id !== productId));
        // Refresh products on page
        fetchProducts();
      } else {
        alert("Failed to add product to category.");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while adding product.");
    } finally {
      setAddingProductId(null);
    }
  };

  const handleRemoveProductFromCategory = async (product: Product) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove "${product.title}" from "${categoryName}"?`
    );
    if (!confirmRemove) return;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      // 1. Fetch categories to find 'Uncategorized'
      const catRes = await fetch(`${baseUrl}/categories`);
      const catData = await catRes.json();
      const categories: Category[] = catData.success ? catData.data : [];
      
      let uncategorizedId = "";
      const uncategorized = categories.find(
        (c) => c.name.toLowerCase() === "uncategorized" || c.slug === "uncategorized"
      );
      
      const token = Cookies.get("accessToken");

      if (uncategorized) {
        uncategorizedId = uncategorized.id;
      } else {
        // 2. If 'Uncategorized' doesn't exist, create it
        const createRes = await fetch(`${baseUrl}/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: "Uncategorized" }),
        });
        const createData = await createRes.json();
        if (createData.success || createRes.ok) {
          const newCat = createData.data || createData;
          uncategorizedId = newCat.id;
        } else {
          if (categories.length > 0) {
            uncategorizedId = categories[0].id;
          } else {
            alert("Could not find or create Uncategorized category fallback.");
            return;
          }
        }
      }

      // 3. Update product's categoryId to the Uncategorized ID
      const res = await fetch(`${baseUrl}/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ categoryId: uncategorizedId }),
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to remove product from category.");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred while removing product.");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableProducts = allAvailableProducts.filter((p) =>
    p.title.toLowerCase().includes(addSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button if filtering by category */}
      {categoryId && (
        <button
          onClick={() => router.push("/dashboard/categories")}
          className="flex items-center space-x-2 text-sm font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Categories</span>
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            {categoryId
              ? `Products in "${categoryName || "Category"}"`
              : "Products"}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {categoryId
              ? `Manage and customize products assigned to this category.`
              : "Manage your inventory and product listings."}
          </p>
        </div>

        <div className="flex space-x-3">
          {categoryId ? (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Product to Category</span>
            </button>
          ) : (
            <Link
              href="/dashboard/products/new"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md relative">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Filter products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
        {categoryId && (
          <button
            onClick={() => router.push("/dashboard/products")}
            className="text-xs font-semibold text-text-muted hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear Category Filter
          </button>
        )}
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
              <th className="px-6 py-4 w-28 text-right">Actions</th>
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
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center" colSpan={6}>
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                    <Package className="h-12 w-12" />
                    <p className="font-medium">No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const img = product.images?.[0];
                const imgUrl = img
                  ? typeof img === "string"
                    ? img
                    : (img as any).url
                  : null;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        !target.closest('input[type="checkbox"]') &&
                        !target.closest("button") &&
                        !target.closest("a")
                      ) {
                        router.push(`/products/${product.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border-main text-text-main focus:ring-zinc-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-background rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-border-main">
                          {imgUrl ? (
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
                            {product.category?.name || "Uncategorized"}
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
                        ৳{Number(product.price).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {categoryId && (
                          <button
                            onClick={() => handleRemoveProductFromCategory(product)}
                            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove from Category"
                          >
                            <FolderMinus className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Link>
                      </div>
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
            Showing {filteredProducts.length} products
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

      {/* Add Product to Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl border border-border-main shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-background">
              <div>
                <h3 className="font-bold text-text-main">
                  Add Products to "{categoryName}"
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Select products to associate with this category.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors text-text-muted hover:text-zinc-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border-main bg-zinc-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search available products..."
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loadingAvailable ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  <p className="text-xs text-text-muted">Loading available products...</p>
                </div>
              ) : filteredAvailableProducts.length === 0 ? (
                <div className="text-center py-12 opacity-40">
                  <Package className="h-10 w-10 mx-auto text-text-muted mb-2" />
                  <p className="text-sm font-medium text-text-main">No products available</p>
                </div>
              ) : (
                filteredAvailableProducts.map((p) => {
                  const img = p.images?.[0];
                  const imgUrl = img
                    ? typeof img === "string"
                      ? img
                      : (img as any).url
                    : null;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-white border border-border-main rounded-lg hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 bg-background rounded border border-border-main overflow-hidden flex items-center justify-center flex-shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4.5 w-4.5 text-text-muted" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{p.title}</p>
                          <p className="text-xs text-text-muted">৳{Number(p.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddProductToCategory(p.id)}
                        disabled={addingProductId === p.id}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                      >
                        {addingProductId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Add to Category</span>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-border-main flex justify-end bg-background">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
