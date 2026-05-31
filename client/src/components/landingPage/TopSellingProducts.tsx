"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const featuredProducts = [
  { id: 1, name: "Organic Tomatoes", price: 4.99, originalPrice: 6.99, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200", rating: 4.5 },
  { id: 2, name: "Fresh Strawberries", price: 5.99, originalPrice: 7.99, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200", rating: 4.8 },
  { id: 3, name: "Farm Eggs (12pcs)", price: 3.99, originalPrice: 4.99, image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200", rating: 4.7 },
  { id: 4, name: "Fresh Milk 1L", price: 2.49, originalPrice: 2.99, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200", rating: 4.6 },
];

export default function TopSellingProducts() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-main">Top Selling Products</h2>
          <Link href="/products" className="text-primary flex items-center gap-1 hover:underline font-medium">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-border-main p-4 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="relative aspect-square bg-background rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium z-10">
                  SALE
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-text-muted">{product.rating}</span>
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-text-muted line-through">${product.originalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-3 bg-primary hover:bg-primary-hover opacity-0 group-hover:opacity-100 transition-all duration-200">
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
