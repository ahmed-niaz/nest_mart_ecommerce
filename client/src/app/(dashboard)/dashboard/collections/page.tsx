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
} from "lucide-react";
import Link from "next/link";

import Cookies from "js-cookie";

interface Collection {
  id: string;
  title: string;
  productCount: number;
  status: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCollections = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/collections`);
      const data = await res.json();
      if (data.success) {
        setCollections(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle("");
        fetchCollections();
      } else {
        setError(data.message || "Failed to create collection");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-main">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Collections</h1>
          <p className="text-text-muted text-sm">Group your products into collections to make storefront navigation easier.</p>
        </div>
        <Link
          href="/dashboard/collections/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Create Collection</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md relative">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Filter collections..."
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

      {/* Collections Table */}
      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4 w-12">
                <input type="checkbox" className="rounded border-border-main text-text-main focus:ring-zinc-900" />
              </th>
              <th className="px-6 py-4">Collection</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Products</th>
              <th className="px-6 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={5}>
                    <div className="h-8 bg-background rounded"></div>
                  </td>
                </tr>
              ))
            ) : collections.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center" colSpan={5}>
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                    <FolderOpen className="h-12 w-12 text-text-muted" />
                    <p className="font-medium text-zinc-600">No collections found</p>
                  </div>
                </td>
              </tr>
            ) : (
              collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-border-main text-text-main focus:ring-zinc-900" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center border border-border-main">
                        <FolderOpen className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main group-hover:text-black transition-colors">
                          {collection.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-background text-text-main">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-zinc-600" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600 font-medium">
                      {collection.productCount} {collection.productCount === 1 ? "product" : "products"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-text-muted hover:text-black hover:bg-zinc-100 rounded-full transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-background border-t border-border-main flex items-center justify-between">
          <p className="text-xs text-text-muted">Showing {collections.length} collections</p>
          <div className="flex space-x-1">
            <button className="p-2 text-text-muted hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-30" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 text-text-muted hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-30" disabled>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border-main shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-background">
              <h3 className="font-bold text-text-main">Create New Collection</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-200 rounded-lg transition-colors text-text-muted hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Collection Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Clothing, Summer Sale"
                  className="w-full px-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Collection</span>
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
