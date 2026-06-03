"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Our very best organic foods",
    subtitle: "Shop perfect health boosters",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
    link: "/products?category=organic",
  },
  {
    id: 2,
    title: "Fresh from local farms",
    subtitle: "Support local agriculture",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80",
    link: "/products",
  },
  {
    id: 3,
    title: "Premium Spices & Oils",
    subtitle: "Elevate your cooking today",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80",
    link: "/products?category=spices",
  },
];

export default function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 60% Slider Area */}
          <div className="lg:w-[60%] relative rounded-2xl overflow-hidden bg-primary shadow-sm h-[400px] sm:h-[450px]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="flex-[0_0_100%] min-w-0 relative h-full"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

                    <div className="relative h-full flex flex-col justify-center px-8 sm:px-12 max-w-xl">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {slide.title}
                      </h2>
                      <p className="text-lg text-white/90 mb-8 font-medium">
                        {slide.subtitle}
                      </p>
                      <div>
                        <Link href={slide.link}>
                          <Button
                            size="lg"
                            className="bg-white text-text-main hover:bg-gray-100 font-bold px-8 h-12 rounded-full"
                          >
                            Shop now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls */}
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedIndex
                      ? "w-6 bg-white"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 40% Static Side Cards */}
          <div className="lg:w-[40%] flex flex-col gap-6">
            {/* Single Side Card to match Etsy layout */}
            <Link
              href="/products?sort=popular"
              className="group relative rounded-2xl overflow-hidden shadow-sm h-[400px] sm:h-[450px] bg-surface-secondary block"
            >
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
                alt="Trending Items"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                  Rising sellers you'll
                  <br />
                  want to get to know
                </h3>
                <span className="text-white font-medium text-base flex items-center gap-2 group-hover:underline">
                  Shop now <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
