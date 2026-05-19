"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Image as ImageIcon, Search, Tag, X, Loader2, Info } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

interface Product {
  id: string;
  title: string;
  price: string;
  images: string[];
}

export default function NewCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    themeTemplate: "Default collection",
    image: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/products`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const file = e.target.files[0];
      const uploadData = new FormData();
      uploadData.append("file", file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/uploads/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: uploadData,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setFormData({ ...formData, image: result.url });
      } else {
        alert(result.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        themeTemplate: formData.themeTemplate,
        image: formData.image || undefined,
        productIds: selectedProducts,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard/collections");
      } else {
        alert(data.message || "Failed to save collection");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Error saving collection.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-24 font-sans text-text-main">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/collections"
            className="p-2 bg-surface border border-border-main rounded-lg text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-bold text-text-main">Create collection</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/collections"
            className="px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Discard
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Collection"
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Description</label>
              <textarea
                rows={6}
                placeholder="Describe your collection..."
                className="w-full px-4 py-3 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none resize-y"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Products Selector */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-text-main border-b border-border-main pb-2">Products</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border border-border-main rounded-lg p-2 bg-background">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 opacity-50">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-text-muted" />
                  <p className="text-xs font-medium">There are no products in this collection.</p>
                  <p className="text-[10px]">Search or browse to add products.</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 hover:bg-zinc-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-border-main text-text-main focus:ring-zinc-900"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                      />
                      <div className="w-10 h-10 bg-surface border border-border-main rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main">{product.title}</p>
                        <p className="text-xs text-text-muted">${product.price}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-text-muted">Selected {selectedProducts.length} product(s)</p>
          </div>

          {/* Search Engine Listing */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-text-main border-b border-border-main pb-2">Search engine listing</h2>
            <div className="pt-2">
              <p className="text-sm text-text-main">{formData.title || "Collection title"}</p>
              <p className="text-[11px] text-green-700">http://localhost:3000/collections/{formData.title.toLowerCase().replace(/\s+/g, '-') || "new-collection"}</p>
              <p className="text-xs text-text-muted line-clamp-2 mt-1">{formData.description || "Add a description to see how this collection might appear in a search engine listing."}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main flex justify-between items-center">
              <span>Publishing</span>
              <span className="text-xs text-text-muted font-normal cursor-pointer hover:underline">Manage</span>
            </h2>
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Online Store
              </p>
              <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex items-start space-x-2 border border-blue-100">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>To add this collection to your online store's navigation, you need to update your menu.</p>
              </div>
              <p className="text-xs font-bold text-zinc-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Point of Sale
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main">Image</h2>
            <div className="border-2 border-dashed border-border-main rounded-lg p-6 flex flex-col items-center justify-center relative hover:bg-zinc-50 transition-colors">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
                accept="image/*"
              />
              {uploading ? (
                <Loader2 className="h-8 w-8 text-text-muted animate-spin" />
              ) : formData.image ? (
                <div className="relative group w-full">
                  <img src={formData.image} alt="Collection" className="w-full h-auto rounded object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity">
                    <p className="text-white text-xs font-bold">Replace Image</p>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-bold text-blue-600">Add image</p>
                  <p className="text-[10px] text-text-muted mt-1 text-center">or drop an image to upload</p>
                </>
              )}
            </div>
          </div>

          {/* Theme template */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main">Theme template</h2>
            <div className="space-y-1.5">
              <select
                className="w-full px-3 py-2 border border-border-main bg-background rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none font-medium text-zinc-700"
                value={formData.themeTemplate}
                onChange={(e) => setFormData({ ...formData, themeTemplate: e.target.value })}
              >
                <option value="Default collection">Default collection</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
