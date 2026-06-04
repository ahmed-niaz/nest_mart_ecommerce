"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  categoriesImage?: string;
  productCount: number;
}

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json();
      if (data.success && data.data) {
        const nameMap = new Map<string, Category>();
        data.data.forEach((cat: Category) => {
          const name = (cat.name || cat.title || "").trim();
          const lowerName = name.toLowerCase();
          const slug = (cat.slug || "").toLowerCase();

          if (
            lowerName.includes("honey & functional foods") ||
            lowerName.includes("duplicate") ||
            slug.includes("honey-functional-foods")
          ) {
            return;
          }

          const existing = nameMap.get(lowerName);
          if (!existing || (cat.productCount || 0) > (existing.productCount || 0)) {
            nameMap.set(lowerName, cat);
          }
        });
        return Array.from(nameMap.values());
      }
      return [];
    },
  });

  const [catRef, catApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    if (catApi) catApi.reInit();
  }, [catApi, categories]);

  const scrollPrev = useCallback(() => {
    if (catApi) catApi.scrollPrev();
  }, [catApi]);

  const scrollNext = useCallback(() => {
    if (catApi) catApi.scrollNext();
  }, [catApi]);

  if (isLoading) {
    return (
      <section className="py-20 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-[0_0_180px] min-w-0 bg-white rounded-2xl p-6 border border-border-light flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded-full mb-4"></div>
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
              Shop by Category
            </h2>
            <p className="text-text-muted mt-2 hidden sm:block">
              Explore our wide selection of premium products.
            </p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            View All{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="relative group">
          <div className="overflow-hidden" ref={catRef}>
            <div className="flex gap-6">
              {categories.map((category) => {
                const imageSrc =
                  category.categoriesImage ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                return (
                  <div
                    key={category.id}
                    className="flex-[0_0_160px] sm:flex-[0_0_180px] min-w-0"
                  >
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="block group/card"
                    >
                      <div className="bg-white rounded-2xl p-6 text-center border border-border-light shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 transform group-hover/card:-translate-y-1">
                        <div className="w-24 h-24 mx-auto mb-4 bg-primary-light/50 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover/card:scale-105">
                          <img
                            src={imageSrc}
                            alt={category.name || category.title || ""}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-text-main group-hover/card:text-primary transition-colors truncate">
                          {category.name || category.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          {categories.length > 5 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border border-border-main shadow-lg rounded-full p-2.5 text-text-secondary hover:text-text-main hover:bg-gray-50 z-10 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border border-border-main shadow-lg rounded-full p-2.5 text-text-secondary hover:text-text-main hover:bg-gray-50 z-10 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
