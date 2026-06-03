"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  Image as ImageIcon,
  Camera,
  Edit2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

interface Category {
  id: string;
  name: string;
  slug: string;
  categoriesImage: string | null;
  productCount?: number;
  status?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditCategoryId(null);
    setNewTitle("");
    setNewImage(null);
    setNewImagePreview("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setIsEditMode(true);
    setEditCategoryId(category.id);
    setNewTitle(category.name);
    setNewImage(null);
    setNewImagePreview(category.categoriesImage || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    setError("");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const formData = new FormData();
      formData.append("name", newTitle.trim());
      if (newImage) {
        formData.append("categoriesImage", newImage);
      }

      const url = isEditMode
        ? `${baseUrl}/categories/${editCategoryId}`
        : `${baseUrl}/categories`;

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok || data.success) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        setError(
          data.message ||
            `Failed to ${isEditMode ? "update" : "create"} category`,
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      await fetch(`${baseUrl}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-main">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Categories</h1>
          <p className="text-text-muted text-sm">
            Organize your products into categories with cover images.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Create Category</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md relative">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={4}>
                    <div className="h-8 bg-background rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center" colSpan={4}>
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                    <FolderOpen className="h-12 w-12 text-text-muted" />
                    <p className="font-medium text-zinc-600">
                      No categories found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-zinc-50 transition-colors group"
                >
                  <td className="px-6 py-4 w-24">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden border border-border-main flex items-center justify-center">
                      {category.categoriesImage ? (
                        <img
                          src={category.categoriesImage}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-text-main group-hover:text-black transition-colors">
                      {category.name}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      /{category.slug}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/products?category=${category.id}`}
                        className="text-xs font-bold text-primary hover:text-primary-hover underline underline-offset-2 transition-colors mr-2"
                      >
                        Manage Products
                      </Link>
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-zinc-500 hover:text-primary hover:bg-zinc-100 p-2 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-background">
              <h3 className="font-bold text-text-main">
                {isEditMode ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-200 rounded-lg transition-colors text-text-muted hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative group cursor-pointer">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border-main flex flex-col items-center justify-center bg-gray-50 overflow-hidden hover:bg-gray-100 transition-colors relative">
                      {newImagePreview ? (
                        <>
                          <img
                            src={newImagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
                          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                            Upload
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Functional Foods"
                    className="w-full px-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newTitle.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>
                      {isEditMode ? "Save Changes" : "Create Category"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
