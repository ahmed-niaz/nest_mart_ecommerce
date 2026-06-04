"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  UserCircle,
  Camera,
  Loader2,
  CheckCircle2,
  MapPin,
  Building,
  Hash,
  XCircle,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Toast notifications state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
        email: user.email || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
    }
  }, [user]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await api.patch("/users/me", formData);
      const data = res.data;
      if (data.success) {
        setSuccess(true);
        await checkAuth(); // Refresh the user object across the application header/navbar
        setToastType("success");
        setToastMessage("Your profile information has been successfully updated.");
        setShowToast(true);
      } else {
        throw new Error(data.message || "Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const msg = error.response?.data?.message || error.message || "Failed to update profile. Please try again.";
      setToastType("error");
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await api.post("/uploads/image", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      
      // Resolve wrapped or direct response
      const resolvedData = data.data || data;
      if (resolvedData && resolvedData.url) {
        setFormData((prev) => ({ ...prev, avatar: resolvedData.url }));
        setToastType("success");
        setToastMessage("Profile picture uploaded successfully. Don't forget to save changes!");
        setShowToast(true);
      } else {
        throw new Error(data.message || "Failed to upload profile picture.");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const msg = error.response?.data?.message || error.message || "Failed to upload image. Please try again.";
      setToastType("error");
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Toast Alert Popup */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-border-main shadow-2xl rounded-2xl p-4 flex items-center space-x-3 animate-slide-down max-w-md w-[90%] md:w-full">
          {toastType === "success" ? (
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : (
            <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-main">
              {toastType === "success" ? "Success" : "Error"}
            </p>
            <p className="text-xs text-text-muted mt-0.5 break-words">{toastMessage}</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="p-1 hover:bg-zinc-100 rounded-lg text-text-muted hover:text-zinc-600 shrink-0 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-surface rounded-2xl shadow-xl border border-border-main overflow-hidden">
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
          <div className="absolute -bottom-16 left-12">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full bg-surface border-4 border-white shadow-lg overflow-hidden relative">
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white z-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-background flex items-center justify-center text-text-muted">
                    <UserCircle className="h-16 w-16" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-2 bg-surface rounded-full shadow-md border border-border-main hover:bg-zinc-50 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 cursor-pointer z-20">
                <Camera className="h-4 w-4 text-zinc-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-12 px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-text-main">
                  Account Settings
                </h1>
                {user.isVerified ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-widest animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 uppercase tracking-widest">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-text-muted mt-1">
                Manage your personal information and preferences.
              </p>
            </div>
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Changes Saved
                </span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="tel"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-bold text-text-main border-b border-border-main pb-2">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 md:col-span-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    City
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    Postal Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-border-main mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex items-center space-x-2 px-10 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Update Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
