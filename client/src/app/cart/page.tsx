"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-orange-200">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added any items to your cart yet.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary-hover text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all hover:-translate-y-1">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
          Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl border border-border-main shadow-sm overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="grid sm:grid-cols-12 gap-4 items-center">
                      {/* Product Details */}
                      <div className="col-span-6 flex items-center gap-4">
                        <Link
                          href={`/products/${item.id}`}
                          className="shrink-0"
                        >
                          <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag size={24} />
                              </div>
                            )}
                          </div>
                        </Link>
                        <div>
                          <Link href={`/products/${item.id}`}>
                            <h3 className="font-bold text-gray-900 hover:text-primary transition-colors leading-tight mb-1">
                              {item.title}
                            </h3>
                          </Link>
                          <p className="text-sm font-semibold text-gray-500">
                            ৳{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Mobile/Desktop */}
                      <div className="col-span-6 sm:col-span-3 flex items-center sm:justify-center">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white p-0.5 shadow-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-6 sm:col-span-2 text-right hidden sm:block">
                        <p className="font-bold text-gray-900">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="col-span-6 sm:col-span-1 flex justify-end">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Mobile Total */}
                      <div className="col-span-12 sm:hidden flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                        <span className="text-sm text-gray-500 font-medium">
                          Total:
                        </span>
                        <span className="font-bold text-gray-900">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl border border-border-main shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 text-sm font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900">
                    ৳{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-100">
                  <span>Estimated Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span className="text-gray-900">
                      ৳{shipping.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-black text-primary">
                    ৳{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 group">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
