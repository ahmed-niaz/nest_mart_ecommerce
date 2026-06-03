"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  price: number;
  category?: { name: string };
  images: any[];
  quantity: number;
  variants?: { id: string }[];
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/products`);
        const data = await res.json();
        if (data.success && data.data) {
          // Fetch top 4 products
          setProducts(data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch top products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.quantity <= 0) return;

    setAddingId(product.id);
    const variantId = product.variants?.[0]?.id;
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: 1,
      variantId: variantId,
    });

    setTimeout(() => setAddingId(null), 1000);
  };

  if (loading) {
    return (
      <section className="py-24 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex bg-white rounded-2xl p-4 border border-border-light h-[160px]"
              >
                <div className="w-1/3 bg-gray-200 animate-pulse rounded-xl h-full"></div>
                <div className="w-2/3 pl-5 flex flex-col justify-center">
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-4"></div>
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-surface-secondary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
              <TrendingUp className="text-primary w-8 h-8" /> Top Selling
            </h2>
            <p className="text-text-muted mt-2 hidden sm:block">
              Our most popular products based on customer sales.
            </p>
          </div>
          <Link
            href="/products?sort=popular"
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            View All{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product, index) => {
            const defaultImage = product.images?.[0]?.url || "";
            const isOutOfStock = product.quantity <= 0;

            return (
              <div
                key={product.id}
                className="group flex bg-white rounded-2xl overflow-hidden border border-border-main hover:border-primary/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[160px] sm:h-[180px]"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="relative w-2/5 sm:w-1/3 shrink-0 overflow-hidden bg-surface-secondary"
                >
                  {defaultImage ? (
                    <img
                      src={defaultImage}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-text-muted/30" />
                    </div>
                  )}
                  {/* Rank Badge */}
                  <div className="absolute top-0 left-0 bg-text-main text-white font-bold w-8 h-8 flex items-center justify-center text-sm rounded-br-lg shadow-sm z-10">
                    #{index + 1}
                  </div>
                </Link>

                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                  <Link href={`/products/${product.id}`} className="block">
                    <p className="text-[11px] sm:text-xs font-semibold text-text-muted mb-1 uppercase tracking-wide truncate">
                      {product.category?.name || "General"}
                    </p>
                    <h3 className="text-sm sm:text-base font-semibold text-text-main mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-400 mb-2">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-gray-200" />
                    </div>
                  </Link>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-sm sm:text-lg font-bold text-text-main">
                        ৳{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      disabled={isOutOfStock || addingId === product.id}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="px-3 h-8 sm:h-9 text-xs sm:text-sm"
                    >
                      {addingId === product.id ? "Added!" : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
