"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Phone, UserCircle, Camera, Loader2, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";

export default function ProfilePage() {
  const { user } = useAuth();
  const token = Cookies.get("accessToken");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        // Profile update successful - context will refresh on reload or manual re-fetch
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-surface rounded-2xl shadow-xl border border-border-main overflow-hidden">
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
          <div className="absolute -bottom-16 left-12">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full bg-surface border-4 border-white shadow-lg overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-background flex items-center justify-center text-text-muted">
                    <UserCircle className="h-16 w-16" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-surface rounded-full shadow-md border border-border-main hover:bg-zinc-50 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                <Camera className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-12 px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text-main">Account Settings</h1>
              <p className="text-text-muted">Manage your personal information and preferences.</p>
            </div>
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-4">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Changes Saved</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 opacity-60">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    disabled
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm cursor-not-allowed"
                    value={user.email}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1 italic">Email cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="tel"
                    className="w-full pl-11 pr-4 py-3 bg-background border border-border-main rounded-xl text-sm focus:ring-2 focus:ring-zinc-950 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-6 border-t border-border-main mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-10 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
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
