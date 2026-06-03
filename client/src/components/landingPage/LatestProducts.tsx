"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
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

export default function LatestProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/products?limit=4`);
        const data = await res.json();
        if (data.success && data.data) {
          // If the API returns paginated data (has products array)
          setProducts(data.data.products || data.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch latest products:", err);
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
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border-light p-4"
              >
                <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-xl mb-4"></div>
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded mb-4"></div>
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
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
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
              New Arrivals
            </h2>
            <p className="text-text-muted mt-2 hidden sm:block">
              Check out the latest additions to our store.
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            View All{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const defaultImage = product.images?.[0]?.url || "";
            const isOutOfStock = product.quantity <= 0;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border-main hover:border-primary/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-surface-secondary"
                >
                  {defaultImage ? (
                    <img
                      src={defaultImage}
                      alt={product.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-text-muted/30" />
                    </div>
                  )}
                  {/* Stock Badge */}
                  {isOutOfStock ? (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-text-main font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md shadow-sm">
                      Out of Stock
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-primary text-white font-bold px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-md shadow-sm">
                      New
                    </div>
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <Link
                    href={`/products/${product.id}`}
                    className="block flex-1"
                  >
                    <p className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                      {product.category?.name || "General"}
                    </p>
                    <h3 className="text-base font-semibold text-text-main mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-400 mb-4">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current text-gray-200" />
                      <span className="text-xs text-text-muted ml-1">(12)</span>
                    </div>
                  </Link>

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-border-light">
                    <div>
                      <span className="text-xs text-text-muted block mb-0.5">
                        Price
                      </span>
                      <span className="text-lg font-bold text-text-main">
                        ৳{Number(product.price).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      disabled={isOutOfStock || addingId === product.id}
                      onClick={(e) => handleAddToCart(product, e)}
                      className="px-3"
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
