"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, AlertTriangle, Users, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useAuth } from "@/lib/auth-context";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN") {
      fetchUsers();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(data.message || "Failed to update role");
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Error updating role.");
    } finally {
      setUpdating(null);
    }
  };

  if (!user) return null;

  if (user.role !== "SUPER_ADMIN") {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-12 bg-surface rounded-2xl border border-border-main shadow-sm text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-text-main mb-2">Access Denied</h1>
        <p className="text-text-muted">
          This feature is not available in your website. Only Super Administrators can access the role management portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-text-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center">
            <Settings className="w-6 h-6 mr-3 text-zinc-600" />
            Platform Settings
          </h1>
          <p className="text-text-muted text-sm mt-1">Super Admin portal for assigning permissions and roles.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-main bg-background">
          <h2 className="text-lg font-bold text-text-main flex items-center">
            <Shield className="w-5 h-5 mr-2 text-zinc-600" />
            Role Management
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Promote or demote users across the application.
          </p>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={4}>
                    <div className="h-4 bg-background rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-text-main">
                      {u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'No Name Provided'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      'bg-background text-zinc-600'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="px-3 py-1.5 border border-border-main rounded-lg text-xs font-bold bg-surface focus:ring-2 focus:ring-zinc-900 outline-none disabled:opacity-50"
                      value={u.role}
                      disabled={updating === u.id || u.role === 'SUPER_ADMIN'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                      {u.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                    </select>
                    {updating === u.id && <Loader2 className="w-4 h-4 ml-2 inline animate-spin text-text-muted" />}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
