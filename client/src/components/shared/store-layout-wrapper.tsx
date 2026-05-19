'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function StoreLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Hide store layout (Navbar/Footer) on all admin and dashboard routes
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-200px)]">
        {children}
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold">NestMart</span>
            </div>
            <p className="text-text-muted text-sm">
              Your trusted online grocery store delivering fresh products to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li><a href="/collections/fresh-vegetables" className="hover:text-white transition-colors">Fresh Vegetables</a></li>
              <li><a href="/collections/fresh-fruits" className="hover:text-white transition-colors">Fresh Fruits</a></li>
              <li><a href="/collections/dairy-&-eggs" className="hover:text-white transition-colors">Dairy & Eggs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>support@nestmart.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-text-muted text-sm">
          © 2026 NestMart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
