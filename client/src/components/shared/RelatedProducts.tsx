"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId?: string;
  currentProductId: string;
}) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["related-products", categoryId],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const url = categoryId
        ? `${baseUrl}/products?category=${categoryId}`
        : `${baseUrl}/products`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        return data.data
          .filter((p: any) => p.id !== currentProductId)
          .slice(0, 4);
      }
      return [];
    },
  });

  if (isLoading || products.length === 0) return null;

  return (
    <section className="py-12 mt-12 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[24px]">
        {products.map((product: any) => {
          const defaultImage = product.images?.[0]?.url || "";
          const isOutOfStock = product.quantity <= 0;
          return (
            <div
              key={product.id}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border-main hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link
                href={`/products/${product.id}`}
                className="relative block aspect-[4/3] overflow-hidden bg-gray-100"
              >
                {defaultImage ? (
                  <img
                    src={defaultImage}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50" />
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="bg-white text-gray-900 font-bold px-3 py-1 text-sm rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/products/${product.id}`} className="block flex-1">
                  <h3 className="text-gray-900 font-bold mb-1 line-clamp-2 hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-black text-primary">
                      ৳{Number(product.price).toFixed(2)}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
