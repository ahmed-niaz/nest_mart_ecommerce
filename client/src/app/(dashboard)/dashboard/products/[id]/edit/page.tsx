"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<
    { file?: File; previewUrl: string; publicId?: string }[]
  >([]);

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

  const { data: collectionsList = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/collections`);
      const data = await res.json();
      return data.success ? data.data : [];
    },
  });

  const { data: categoriesList = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json();
      return data.success ? data.data : [];
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/products/${productId}`);
        const data = await res.json();

        if (data.success && data.data) {
          const product = data.data;

          setFormData({
            title: product.title || "",
            description: product.description || "",
            price: product.price ? product.price.toString() : "",
            compareAtPrice: "", // Assuming no compareAtPrice in data
            costPerItem: "", // Assuming no costPerItem in data
            sku: product.variants?.[0]?.sku || "",
            barcode: "", // Assuming no barcode in data
            quantity: product.quantity ? product.quantity.toString() : "0",
            vendorName: product.vendorName || "",
            collectionName: product.collectionIds?.[0] || "",
            category: product.categoryId || "",
            themeTemplate: "Default product",
            status: product.status || "ACTIVE",
          });

          // Fetch images (might be just URLs or objects)
          if (product.images && Array.isArray(product.images)) {
            const existingImages = product.images.map((img: any) => {
              if (typeof img === "string") return { previewUrl: img };
              return { previewUrl: img.url, publicId: img.publicId };
            });
            setUploadedImages(existingImages);
          }
        } else {
          console.error("Failed to load product data");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setFetching(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (urlToRemove: string) => {
    setUploadedImages(
      uploadedImages.filter((img) => {
        if (img.previewUrl === urlToRemove) {
          if (img.file) URL.revokeObjectURL(img.previewUrl);
          return false;
        }
        return true;
      }),
    );
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
      const uploadData = new FormData();
      uploadData.append("title", formData.title);
      if (formData.description)
        uploadData.append("description", formData.description);
      uploadData.append("price", (parseFloat(formData.price) || 0).toString());
      if (formData.compareAtPrice)
        uploadData.append("compareAtPrice", formData.compareAtPrice);
      if (formData.costPerItem)
        uploadData.append("costPerItem", formData.costPerItem);
      uploadData.append(
        "quantity",
        (parseInt(formData.quantity) || 0).toString(),
      );
      if (formData.sku) uploadData.append("sku", formData.sku);
      if (formData.barcode) uploadData.append("barcode", formData.barcode);
      if (formData.vendorName)
        uploadData.append("vendorName", formData.vendorName);
      if (formData.category) uploadData.append("category", formData.category);
      if (formData.themeTemplate)
        uploadData.append("themeTemplate", formData.themeTemplate);
      if (formData.collectionName)
        uploadData.append(
          "collectionIds",
          JSON.stringify([formData.collectionName]),
        );
      if (tags.length > 0) uploadData.append("tags", JSON.stringify(tags));
      uploadData.append("status", formData.status);

      const existingImgUrls = uploadedImages
        .filter((img) => !img.file)
        .map((img) => img.previewUrl);
      if (existingImgUrls.length > 0) {
        uploadData.append("images", JSON.stringify(existingImgUrls));
      }

      uploadedImages.forEach((img) => {
        if (img.file) uploadData.append("images", img.file);
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/products/${productId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: uploadData,
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/products");
      } else {
        alert(data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto space-y-6 pb-20 font-sans text-text-main"
    >
      {/* Sticky Header Top Bar */}
      <div
        className="flex items-center justify-between border-b border-border-main pb-4 sticky bg-white/90 backdrop-blur-md z-20 -mx-8 -mt-8 px-8 pt-8"
        style={{ top: "-32px" }}
      >
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/products"
            className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors border border-border-main bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs text-text-muted">Products</span>
            <h1 className="text-lg font-bold text-text-main leading-none">
              Edit {formData.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
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
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-main">
                Description
              </label>

              {/* Rich Text Editor Mock Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-background border border-border-main border-b-0 rounded-t-lg text-text-muted">
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Add Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Add Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-zinc-200 rounded transition-colors"
                  title="Code block"
                >
                  <Code className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={8}
                placeholder="Write something about this product..."
                className="w-full px-4 py-3 border border-border-main rounded-b-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all bg-background resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Card 2: Media Upload */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">
              Media
            </h2>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pb-4">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square bg-background rounded-xl border border-border-main overflow-hidden group shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.previewUrl)}
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
                <span className="text-sm text-text-muted">
                  or drag and drop
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-medium uppercase tracking-wider">
                Accepts images or webp (max 5MB)
              </p>
            </div>
          </div>

          {/* Card 3: Category */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">
              Category
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase">
                Product Category
              </label>
              <select
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm text-text-main bg-background focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option className="text-zinc-900 bg-white" value="">
                  Choose a product category
                </option>
                {categoriesList.map((cat: any) => (
                  <option
                    className="text-zinc-900 bg-white"
                    key={cat.id}
                    value={cat.id}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-text-muted">
                Determines tax rates and search placement across sales channels.
              </p>
            </div>
          </div>

          {/* Card 4: Pricing */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Compare-at price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compareAtPrice: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Cost per item
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-text-muted text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 outline-none bg-background transition-all font-mono"
                    value={formData.costPerItem}
                    onChange={(e) =>
                      setFormData({ ...formData, costPerItem: e.target.value })
                    }
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
                <label
                  htmlFor="chargeTax"
                  className="text-xs font-semibold text-zinc-600 cursor-pointer"
                >
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
                <label className="text-xs font-bold text-text-muted uppercase">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  placeholder="TSH-001"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Barcode (ISBN, UPC, GTIN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1901283894"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5 max-w-[200px] pt-2">
              <label className="text-xs font-bold text-text-muted uppercase">
                Quantity Available
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2 border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-950 bg-background outline-none transition-all font-mono"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
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
                className="w-full px-3 py-2 border border-border-main rounded-lg text-sm text-text-main bg-background focus:ring-2 focus:ring-zinc-950 outline-none font-medium"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option className="text-zinc-900 bg-white" value="ACTIVE">
                  Active
                </option>
                <option className="text-zinc-900 bg-white" value="DRAFT">
                  Draft
                </option>
                <option className="text-zinc-900 bg-white" value="ARCHIVED">
                  Archived
                </option>
              </select>
              <p className="text-[11px] text-text-muted">
                Draft products will be hidden from the storefront catalogue.
              </p>
            </div>
          </div>

          {/* Sidebar Widget 3: Organization & Collections */}
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-main pb-2 border-b border-border-main">
              Product organization
            </h2>

            <div className="space-y-4">
              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  Vendor
                </label>
                <input
                  type="text"
                  placeholder="e.g. glamnow453"
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                  value={formData.vendorName}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorName: e.target.value })
                  }
                />
              </div>

              {/* Collections */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wide">
                  Collections
                </label>
                <select
                  className="w-full px-4 py-2 border border-border-main rounded-lg text-sm text-text-main bg-background focus:ring-2 focus:ring-zinc-950 outline-none"
                  value={formData.collectionName}
                  onChange={(e) =>
                    setFormData({ ...formData, collectionName: e.target.value })
                  }
                >
                  <option className="text-zinc-900 bg-white" value="">
                    Select a collection
                  </option>
                  {collectionsList.map((col: Collection) => (
                    <option
                      className="text-zinc-900 bg-white"
                      key={col.id}
                      value={col.id}
                    >
                      {col.title}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted font-medium">
                  Add this product to a collection to organize your shop.
                </p>
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
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

          <div className="bg-background border border-border-main p-4 rounded-xl flex items-start space-x-3">
            <Info className="h-5 w-5 text-zinc-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              Adding collections and rich content boosts your e-commerce search
              visibility.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
