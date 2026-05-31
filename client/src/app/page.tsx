import HeroBanner from "@/components/landingPage/HeroBanner";
import Categories from "@/components/landingPage/Categories";
import TopSellingProducts from "@/components/landingPage/TopSellingProducts";
import Features from "@/components/landingPage/Features";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <Categories />
      <TopSellingProducts />
      <Features />
    </div>
  );
}