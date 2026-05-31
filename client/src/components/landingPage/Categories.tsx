"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  title: string;
  slug: string;
  categoriesImage?: string;
  productCount: number;
}

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/categories`);
      const data = await res.json();
      return data.success ? data.data : [];
    }
  });

  const [catRef, catApi] = useEmblaCarousel(
    { 
      loop: categories.length > 4, 
      align: "start", 
      dragFree: true 
    }, 
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  // Reinitialize Embla when categories change
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
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded"></div>
            <div className="h-6 w-24 bg-zinc-200 animate-pulse rounded"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-[0_0_160px] min-w-0 bg-white rounded-xl p-4 border border-border-main flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-200 animate-pulse rounded-full mb-3"></div>
                <div className="h-4 w-24 bg-zinc-200 animate-pulse rounded"></div>
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
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-main">Featured Categories</h2>
          <Link href="/collections" className="text-primary flex items-center gap-1 hover:underline font-medium">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative group">
          <div className="overflow-hidden" ref={catRef}>
            <div className="flex gap-4">
              {categories.map((category) => {
                const imageSrc = category.categoriesImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                return (
                  <div key={category.id} className="flex-[0_0_160px] min-w-0">
                    <Link
                      href={`/collections/${category.slug}`}
                      className="block bg-white rounded-xl p-4 text-center border border-border-main hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="w-20 h-20 mx-auto mb-3 bg-orange-50 rounded-full flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt={category.title} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-medium text-gray-800 hover:text-orange-600 transition-colors truncate">
                        {category.title}
                      </h3>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Navigation buttons */}
          {categories.length > 4 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-primary z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-primary z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
