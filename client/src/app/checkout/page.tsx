"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Lock,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import Cookies from "js-cookie";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function CheckoutForm({
  clientSecret,
  total,
}: {
  clientSecret: string;
  total: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?success=true`,
      },
    });

    if (submitError) {
      setError(submitError.message || "An error occurred with payment.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <Button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          `Pay ৳${total.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  const hasProcessedPayment = React.useRef(false);
  const clearCartRef = React.useRef(clearCart);

  useEffect(() => {
    clearCartRef.current = clearCart;
  }, [clearCart]);

  useEffect(() => {
    if (hasProcessedPayment.current) return;
    const query = new URLSearchParams(window.location.search);
    const redirectStatus = query.get("redirect_status");
    const paymentIntentId = query.get("payment_intent");

    if (query.get("success") === "true" || redirectStatus === "succeeded") {
      hasProcessedPayment.current = true;

      // Verify payment server-side to update order status to PAID
      if (paymentIntentId) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        fetch(`${baseUrl}/payments/verify/${paymentIntentId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Payment verified:", data);
          })
          .catch((err) => {
            console.error("Payment verification failed:", err);
          });
      }

      setSuccess(true);
      clearCartRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = Cookies.get("accessToken");

    if (!token) {
      setError("You must be logged in to checkout.");
      setLoading(false);
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      // 1. Sync local cart to backend first
      const syncPayload = {
        items: items
          .filter((item) => item.variantId)
          .map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
      };

      if (syncPayload.items.length === 0) {
        throw new Error("Your cart is empty or missing valid products.");
      }

      const syncRes = await fetch(`${baseUrl}/cart/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(syncPayload),
      });

      if (!syncRes.ok) {
        const syncData = await syncRes.json();
        throw new Error(
          syncData?.message || "Failed to sync cart with server.",
        );
      }

      // 2. Perform checkout to create order
      const res = await fetch(`${baseUrl}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode: couponCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Checkout failed. Please try again.");
      }

      const newOrderId = data.data.id;
      setOrderId(newOrderId);

      // 3. Create Stripe Payment Intent
      const intentRes = await fetch(
        `${baseUrl}/payments/create-intent/${newOrderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData?.message || "Failed to initialize payment.");
      }

      setClientSecret(intentData.data.clientSecret);
      setStep("payment");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight text-center">
          Order Confirmed!
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-md text-lg">
          Thank you for your purchase. We&apos;ve received your order and will
          begin processing it right away.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 cursor-pointer"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => router.push("/orders")}
            variant="outline"
            className="px-8 py-6 rounded-xl font-bold text-lg cursor-pointer"
          >
            View My Orders
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/cart"
            className="flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Return to Cart
          </Link>
          <div className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-full">
            <Lock size={14} /> Secure Checkout
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-12">
          {/* Main Checkout Area */}
          <div className="lg:w-3/5">
            {step === "shipping" && (
              <form onSubmit={handleProceedToPayment} className="space-y-8">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-main">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-main">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="123 Main St"
                        className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-3 gap-4">
                      <div className="col-span-1 border-r pr-4 border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-span-1 border-r pr-4 border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          ZIP
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {error && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Coupon Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="w-full px-4 py-3 border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-background font-mono uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                        Preparing Checkout...
                      </>
                    ) : (
                      `Proceed to Payment`
                    )}
                  </Button>
                </div>
              </form>
            )}

            {step === "payment" && clientSecret && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-main">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Details
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { theme: "stripe" } }}
                >
                  <CheckoutForm clientSecret={clientSecret} total={total} />
                </Elements>
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setStep("shipping")}
                    className="text-gray-500 text-sm"
                  >
                    &larr; Back to Shipping
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-2/5">
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:sticky lg:top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <ul className="divide-y divide-gray-200 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 mb-6 text-sm font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900">
                    ৳{totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    <span className="text-gray-900">
                      ৳{shipping.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">
                    Total
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 mr-1">BDT</span>
                    <span className="text-3xl font-black text-gray-900">
                      ৳{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
