"use client";

import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const bannerSlides = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200",
  "https://images.unsplash.com/photo-1506617420156-8e4536971650?w=1200"
];

const fixedBannerImage = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800";

export default function HeroBanner() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 h-[400px]">
          {/* Slider 60% */}
          <div className="w-full md:w-[60%] h-full rounded-2xl overflow-hidden relative">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {bannerSlides.map((slide, index) => (
                  <div className="flex-[0_0_100%] min-w-0 h-full relative" key={index}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center p-8">
                      <div className="text-white max-w-md">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Fresh & Organic</h2>
                        <p className="text-lg mb-6">Discover the best quality products for your daily needs.</p>
                        <Button className="bg-primary hover:bg-primary-hover border-0">Shop Now</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Fixed Image 40% */}
          <div className="w-full md:w-[40%] h-full rounded-2xl overflow-hidden relative hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fixedBannerImage} alt="Special Offer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded w-fit mb-2">LIMITED</span>
              <h3 className="text-white text-2xl font-bold mb-2">Summer Fruits Sale</h3>
              <p className="text-white/90 mb-4">Up to 40% off on all organic summer fruits.</p>
              <Button variant="outline" className="border-white text-white hover:bg-white/20 w-fit">View Deals</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
