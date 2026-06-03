"use client"; // force recompile

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import RelatedProducts from "@/components/shared/RelatedProducts";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface ProductVariant {
  id: string;
  sku: string;
  price: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: number;
  images: (ProductImage | string)[];
  quantity: number;
  variants: ProductVariant[];
  status: string;
  categoryId?: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        const data = await res.json();

        if (data.success && data.data) {
          setProduct(data.data);
          const imgs: (ProductImage | string)[] = data.data.images ?? [];
          if (imgs.length > 0) {
            const firstImg = imgs[0];
            setSelectedImage(
              typeof firstImg === "string" ? firstImg : firstImg.url,
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const getImageUrl = (img: ProductImage | string): string =>
    typeof img === "string" ? img : img.url;

  const availableStock = product?.quantity ?? 0;
  const isOutOfStock = availableStock <= 0;

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () =>
    setQuantity((q) => Math.min(q + 1, availableStock));

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    const variantId = product.variants?.[0]?.id;
    addToCart({
      id: product.id,
      variantId,
      title: product.title,
      price: parseFloat(product.price),
      quantity,
      maxStock: availableStock,
      image: selectedImage,
    });

    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-100 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-zinc-100 rounded-xl animate-pulse w-3/4" />
            <div className="h-6 bg-zinc-100 rounded-xl animate-pulse w-1/2" />
            <div className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Product Not Found
        </h2>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const price = parseFloat(product.price);

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-text-muted hover:text-primary mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl border border-border-main overflow-hidden shadow-sm flex items-center justify-center relative">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Image Available</div>
              )}
              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <span className="bg-red-600 text-white font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => {
                  const imgUrl = getImageUrl(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`aspect-square rounded-xl border-2 overflow-hidden bg-white cursor-pointer ${selectedImage === imgUrl ? "border-primary shadow-md" : "border-border-main hover:border-orange-300"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${product.title} ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              {product.title}
            </h1>

            {/* Ratings + Stock Badge */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm font-medium text-text-muted ml-1">
                  (4.8 Reviews)
                </span>
              </div>
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Out of Stock
                </span>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${availableStock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
                >
                  {availableStock <= 5
                    ? `Only ${availableStock} left!`
                    : "In Stock"}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-black text-primary">
                ৳{price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="text-xl font-semibold text-zinc-400 line-through mb-1">
                  ৳{Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-6">
              {isOutOfStock ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      This product is out of stock
                    </p>
                    <p className="text-xs text-red-400 mt-0.5">
                      Check back later or browse similar products.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= availableStock}
                      className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 h-14 text-lg font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                      addedFeedback
                        ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-200"
                        : "bg-primary hover:bg-primary-hover text-white shadow-orange-200"
                    }`}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addedFeedback ? "Added to Cart!" : "Add to Cart"}
                  </Button>
                </div>
              )}

              {/* Low stock warning */}
              {!isOutOfStock && availableStock <= 10 && availableStock > 0 && (
                <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                  <AlertCircle size={12} />
                  Only {availableStock} left in stock — order soon!
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Truck size={20} />
                  </div>
                  Free delivery over ৳50
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Shield size={20} />
                  </div>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      </div>
    </div>
  );
}
