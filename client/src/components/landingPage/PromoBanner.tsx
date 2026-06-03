"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PromoBanner() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-emerald-50 shadow-xl border border-emerald-100">
          {/* Background Image */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/promo_background.png"
              alt="Fresh organic vegetables background"
              className="w-full h-full object-cover opacity-95"
            />
            {/* Soft overlay gradient to ensure high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 via-emerald-50/70 to-transparent"></div>
          </div>

          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:py-24 flex items-center">
            <div className="text-center lg:text-left max-w-xl">
              <span className="inline-block px-4 py-1.5 bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-widest rounded-full mb-6">
                Special Offer
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-5">
                Get 20% Off Your First{" "}
                <span className="text-emerald-600">Organic Box</span>
              </h2>
              <p className="text-lg text-emerald-900/80 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                Experience the freshest, highest quality organic produce
                delivered straight from local farms to your kitchen.
              </p>
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-95 transition-all duration-300"
                >
                  Claim Offer Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
