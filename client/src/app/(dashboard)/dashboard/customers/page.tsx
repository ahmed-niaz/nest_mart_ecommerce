"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Filter, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react";
import Cookies from "js-cookie";

interface Customer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          // Filter out SUPER_ADMIN or ADMIN if we only want customers,
          // but usually the customers page lists all store users.
          setCustomers(data.data.filter((u: Customer) => u.role === 'CUSTOMER'));
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    (c.firstName + " " + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-main">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Customers</h1>
          <p className="text-text-muted text-sm">Manage your registered customers and view their details.</p>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border-main shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md relative">
          <Search className="absolute left-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border-main rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background border-b border-border-main text-text-muted uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={5}>
                    <div className="h-4 bg-background rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td className="px-6 py-20 text-center" colSpan={5}>
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                    <Users className="h-12 w-12 text-text-muted" />
                    <p className="font-medium text-zinc-600">No customers found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-text-main">
                        {customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : 'No Name Provided'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-zinc-600">
                      <Mail className="h-3 w-3" />
                      <span>{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {customer.phone || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {customer.isVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-background text-zinc-600 uppercase tracking-widest">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-text-muted">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
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
