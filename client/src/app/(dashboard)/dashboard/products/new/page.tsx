"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Tag as TagIcon,
  X,
  Save,
  Info,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Code,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";

interface Collection {
  id: string;
  title: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    sku: "",
    barcode: "",
    quantity: "0",
    vendorName: "",
    collectionName: "",
    category: "",
    themeTemplate: "Default product",
    status: "ACTIVE",
  });

  // Fetch collections list using TanStack Query
  const { data: collectionsList = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/collections`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
  });

  // Handle direct upload to NestJS server which uploads to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      
      const uploadData = new FormData();
      for (let i = 0; i < files.length; i++) {
        uploadData.append("files", files[i]);
      }

      const res = await fetch(`${baseUrl}/uploads/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: uploadData,
      });

      const result = await res.json();
      if (res.ok && Array.isArray(result)) {
        const newUrls = result.map((img: any) => img.url);
        setUploadedImages((prev) => [...prev, ...newUrls]);
      } else {
        alert(result.message || "Failed to upload images.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    setUploadedImages(uploadedImages.filter((url) => url !== urlToRemove));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : undefined,
        quantity: parseInt(formData.quantity) || 0,
        sku: formData.sku || undefined,
        barcode: formData.barcode || undefined,
        vendorName: formData.vendorName || undefined,
        category: formData.category || undefined,
        themeTemplate: formData.themeTemplate || undefined,
        collectionIds: formData.collectionName ? [formData.collectionName] : [],
        tags,
        images: uploadedImages,
        status: formData.status,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/products");
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-text-main">
      {/* Sticky Header Top Bar */}
      <div className="flex items-center justify-between border-b border-border-main pb-4 sticky top-0 bg-[#F1F1F1]/95 backdrop-blur-md z-20">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/products"
            className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors border border-border-main bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs text-text-muted">Products</span>
            <h1 className="text-lg font-bold text-text-main leading-none">Add product</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-text-muted italic hidden md:inline">Unsaved product</span>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Larger Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Title and Description */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-main">Title</label>
              <input
                type="text"
                required
                placeholder="Short sleeve t-shirt"
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all bg-background"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-main">Description</label>
              
              {/* Rich Text Editor Mock Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-background border border-border-main border-b-0 rounded-t-lg text-text-muted">
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Underline">
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Align Left">
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Align Center">
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Align Right">
                  <AlignRight className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Add Link">
                  <Link2 className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Add Image">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 hover:bg-zinc-200 rounded transition-colors" title="Code block">
                  <Code className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={8}
                placeholder="Write something about this product..."
                className="w-full px-4 py-3 border border-border-main rounded-b-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all bg-background resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Card 2: Media Upload */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">Media</h2>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-4">
                {uploadedImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-background rounded-xl border border-border-main overflow-hidden group shadow-sm">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-red-600 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-border-main rounded-xl p-8 flex flex-col items-center justify-center space-y-3 hover:bg-zinc-50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={uploading}
              />
              <div className="p-3 bg-background rounded-full text-zinc-600">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-text-main">
                  {uploading ? "Uploading images..." : "Upload new"}
                </span>{" "}
                <span className="text-sm text-text-muted">or drag and drop</span>
              </div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Accepts images or webp (max 5MB)
              </p>
            </div>
          </div>

          {/* Card 3: Category */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">Category</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase">Product Category</label>
              <select
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Choose a product category</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Home & Living">Home & Living</option>
              </select>
              <p className="text-[11px] text-text-muted">Determines tax rates and search placement across sales channels.</p>
            </div>
          </div>

          {/* Card 4: Pricing */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Compare-at price</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Cost per item</label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.costPerItem}
                    onChange={(e) => setFormData({ ...formData, costPerItem: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-6 md:pl-2">
                <input
                  type="checkbox"
                  id="chargeTax"
                  defaultChecked
                  className="rounded border-border-main text-text-main focus:ring-zinc-900"
                />
                <label htmlFor="chargeTax" className="text-xs font-semibold text-zinc-600 cursor-pointer">
                  Charge tax on this product
                </label>
              </div>
            </div>
          </div>

          {/* Card 5: Inventory */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main flex items-center justify-between">
              <span>Inventory</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-muted">Track quantity</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-border-main text-text-main focus:ring-zinc-900"
                />
              </div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  placeholder="TSH-001"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Barcode (ISBN, UPC, GTIN)</label>
                <input
                  type="text"
                  placeholder="e.g. 1901283894"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5 max-w-[200px] pt-2">
              <label className="text-xs font-bold text-text-muted uppercase">Quantity Available</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all font-mono"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (Span 1) */}
        <div className="space-y-6">
          
          {/* Sidebar Widget 1: Status */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main">Status</h2>
            <div className="space-y-2">
              <select
                className="w-full px-3 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none font-medium"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <p className="text-[11px] text-text-muted">Draft products will be hidden from the storefront catalogue.</p>
            </div>
          </div>

          {/* Sidebar Widget 2: Publishing */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-text-main flex items-center justify-between">
              <span>Publishing</span>
            </h2>
            <div className="space-y-2 pt-1 border-t border-border-main text-xs font-semibold text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Online Store</span>
                <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
              </div>
              <div className="flex items-center justify-between">
                <span>Point of Sale</span>
                <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
              </div>
            </div>
          </div>

          {/* Sidebar Widget 3: Organization & Collections */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">Product organization</h2>
            
            <div className="space-y-4">
              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. glamnow453"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                />
              </div>

              {/* Collections */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Collections</label>
                <select
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                  value={formData.collectionName}
                  onChange={(e) => setFormData({ ...formData, collectionName: e.target.value })}
                >
                  <option value="">Select a collection</option>
                  {collectionsList.map((col: Collection) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted font-medium">Add this product to a collection to organize your shop.</p>
              </div>

              {/* Tags */}
              <div className="space-y-2 border-t border-border-main pt-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide flex items-center justify-between">
                  <span>Tags</span>
                  <TagIcon className="h-3.5 w-3.5 text-text-muted" />
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Cotton, New"
                    className="flex-1 px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="p-2 border border-border-main rounded-lg bg-background hover:bg-zinc-200 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-zinc-700" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center bg-background border border-border-main text-text-main px-2.5 py-0.5 rounded-full text-xs font-bold"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 text-text-muted hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Widget 4: Theme Template */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main">Theme template</h2>
            <div className="space-y-1.5">
              <select 
                className="w-full px-3 py-2 border border-border-main bg-background rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 font-medium"
                value={formData.themeTemplate}
                onChange={(e) => setFormData({ ...formData, themeTemplate: e.target.value })}
              >
                <option value="Default product">Default product</option>
              </select>
            </div>
          </div>

          <div className="bg-background border border-border-main p-4 rounded-xl flex items-start space-x-3">
            <Info className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              Adding collections and rich content boosts your e-commerce search visibility.
            </p>
          </div>

        </div>

      </div>
    </form>
  );
}
