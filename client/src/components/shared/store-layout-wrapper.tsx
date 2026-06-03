"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import { Truck, Shield, RotateCcw, Leaf } from "lucide-react";

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">{children}</main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-text-main text-white mt-24">
      {/* Trust Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: "Free Delivery",
                desc: "On orders over ৳50",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                desc: "100% secure checkout",
              },
              {
                icon: Leaf,
                title: "Organic Quality",
                desc: "Certified organic products",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2 bg-white/5 rounded-lg shrink-0">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">N</span>
              </div>
              <span className="text-lg font-bold">NestMart</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Your trusted online grocery store. Fresh, organic products
              delivered to your doorstep.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/products", label: "All Products" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/orders", label: "Track Order" },
                { href: "/faq", label: "FAQ" },
                { href: "/profile", label: "My Account" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>support@nestmart.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} NestMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
