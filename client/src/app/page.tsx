"use client";

import HeroBanner from "@/components/landingPage/HeroBanner";
import Categories from "@/components/landingPage/Categories";
import Features from "@/components/landingPage/Features";
import TopSellingProducts from "@/components/landingPage/TopSellingProducts";
import CategorySection from "@/components/landingPage/CategorySection";
import PromoBanner from "@/components/landingPage/PromoBanner";
import LatestProducts from "@/components/landingPage/LatestProducts";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroBanner />
      <Features />
      <Categories />
      <LatestProducts />

      {/* Popular Categories Sections */}
      <CategorySection title="Flours & Lentils" categorySlug="flours-lentils" />
      <PromoBanner />
      <TopSellingProducts />
      <CategorySection
        title="Functional Foods"
        categorySlug="functional-foods"
      />
    </div>
  );
}
