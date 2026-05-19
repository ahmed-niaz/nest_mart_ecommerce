'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

const collections = [
  'Fresh Vegetables',
  'Fresh Fruits',
  'Meat & Fish',
  'Dairy & Eggs',
  'Bakery',
  'Beverages',
  'Snacks',
  'Frozen Foods',
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border-main shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:bg-primary-hover transition-colors">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-xl font-bold text-primary">NestMart</span>
          </Link>

          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pr-10 border-border-main focus:border-orange-500 focus:ring-orange-500"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 text-text-muted hover:text-orange-600 hover:bg-orange-50"
              >
                <Search size={18} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                <ShoppingCart size={20} />
              </Button>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {user ? (
              <div className="relative group">
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                </Button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border-main rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-text-main">{user.email}</p>
                    <p className="text-xs text-text-muted capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                      Wishlist
                    </Link>
                    {(user.role.toUpperCase() === 'ADMIN' || user.role.toUpperCase() === 'SUPER_ADMIN') && (
                      <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
                        Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary-hover text-white px-4">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-600 hover:text-orange-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full"
              />
            </div>
            <nav className="flex flex-wrap gap-2">
              {collections.slice(0, 4).map((item) => (
                <Link
                  key={item}
                  href={`/collections/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-background rounded-full hover:bg-orange-100 hover:text-primary-hover transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="hidden md:block border-t border-gray-100 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-2 overflow-x-auto">
            {collections.map((item) => (
              <Link
                key={item}
                href={`/collections/${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full whitespace-nowrap transition-all duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}