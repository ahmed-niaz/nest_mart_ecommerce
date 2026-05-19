import Link from "next/link";
import { ArrowRight, Star, Truck, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Vegetables", emoji: "🥬", count: 120 },
  { name: "Fruits", emoji: "🍎", count: 85 },
  { name: "Meat & Fish", emoji: "🥩", count: 65 },
  { name: "Dairy & Eggs", emoji: "🥛", count: 90 },
  { name: "Bakery", emoji: "🍞", count: 55 },
  { name: "Beverages", emoji: "🧃", count: 110 },
];

const featuredProducts = [
  { id: 1, name: "Organic Tomatoes", price: 4.99, originalPrice: 6.99, emoji: "🍅", rating: 4.5 },
  { id: 2, name: "Fresh Strawberries", price: 5.99, originalPrice: 7.99, emoji: "🍓", rating: 4.8 },
  { id: 3, name: "Farm Eggs (12pcs)", price: 3.99, originalPrice: 4.99, emoji: "🥚", rating: 4.7 },
  { id: 4, name: "Fresh Milk 1L", price: 2.49, originalPrice: 2.99, emoji: "🥛", rating: 4.6 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fresh Groceries Delivered to Your Door
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Shop the freshest produce, meats, and everyday essentials. 
              Quality guaranteed, delivery fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-surface text-primary hover:bg-gray-100 font-medium">
                  Shop Now
                </Button>
              </Link>
              <Link href="/collections">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-medium">
                  Browse Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-main">Shop by Category</h2>
            <Link href="/collections" className="text-primary flex items-center gap-1 hover:underline font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/collections/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-surface rounded-xl p-4 text-center border border-border-main hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors text-3xl">
                  {category.emoji}
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-text-muted">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <p className="text-sm font-medium opacity-90 mb-1">Limited Time Offer</p>
              <h3 className="text-3xl font-bold mb-2">Fresh Vegetables</h3>
              <p className="text-xl mb-4">Up to 30% Off</p>
              <Link href="/collections/fresh-vegetables">
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  Shop Now
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-8 text-white">
              <p className="text-sm font-medium opacity-90 mb-1">Special Deal</p>
              <h3 className="text-3xl font-bold mb-2">Organic Fruits</h3>
              <p className="text-xl mb-4">Buy 2 Get 1 Free</p>
              <Link href="/collections/fresh-fruits">
                <Button variant="outline" className="border-white text-white hover:bg-white/20">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-text-main">Featured Products</h2>
            <Link href="/products" className="text-primary flex items-center gap-1 hover:underline font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-surface rounded-xl border border-border-main p-4 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="relative aspect-square bg-background rounded-lg mb-3 flex items-center justify-center text-5xl">
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                    SALE
                  </span>
                  {product.emoji}
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

      <section className="py-12 bg-surface border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Truck className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free Delivery</h3>
              <p className="text-text-muted text-sm">On orders over $50</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <RefreshCw className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
              <p className="text-text-muted text-sm">30-day return policy</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
              <p className="text-text-muted text-sm">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}