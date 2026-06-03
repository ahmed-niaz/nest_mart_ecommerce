"use client";

import { Truck, RefreshCw, Shield, Leaf, Clock, Award } from "lucide-react";

export default function Features() {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-14 h-14 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Truck className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Free Delivery</h3>
            <p className="text-text-muted text-sm">On orders over ৳50</p>
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
  );
}
