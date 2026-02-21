"use client";

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (items.length === 0 || isRedirecting) return;

    setIsRedirecting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Failed to get checkout URL", data);
        alert("Checkout failed. Please try again.");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Shopping Cart
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-0">
                {/* Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-6 pb-4 border-b border-[#E8E4DE] text-[12px] uppercase tracking-wider font-medium text-[#757575]">
                  <span>Product</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Total</span>
                  <span className="w-10" />
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[80px_1fr] md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-6 py-6 border-b border-[#E8E4DE] items-center"
                  >
                    {/* Product */}
                    <div className="col-span-2 md:col-span-1 flex gap-4 items-center">
                      <a href={`/products/${item.handle}`} className="relative w-20 h-20 flex-shrink-0 rounded-[8px] overflow-hidden bg-white">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      </a>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                          <a href={`/products/${item.handle}`} className="hover:text-[#5C4B3D] transition-colors">
                            {item.name}
                          </a>
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">{item.subtitle}</p>
                        <span className="text-[13px] text-[#1A1A1A] font-medium md:hidden mt-1 block">
                          Rs. {item.price.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-center col-start-2 md:col-start-auto">
                      <div className="flex items-center border border-[#E8E4DE] rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] disabled:opacity-30 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[13px] font-medium border-x border-[#E8E4DE]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#757575] hover:text-[#1A1A1A] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <span className="hidden md:block text-[15px] font-semibold text-[#1A1A1A] text-right">
                      Rs. {(item.price * item.quantity).toLocaleString("en-IN")}.00
                    </span>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 flex items-center justify-center text-[#757575] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[12px] p-6 border border-[#E8E4DE] sticky top-8">
                  <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-6">Order Summary</h2>

                  <div className="space-y-3 text-[14px]">
                    <div className="flex justify-between text-[#555]">
                      <span>Subtotal</span>
                      <span>Rs. {totalPrice.toLocaleString("en-IN")}.00</span>
                    </div>
                    <div className="flex justify-between text-[#555]">
                      <span>Shipping</span>
                      <span>{totalPrice >= 1950 ? "Free" : "Rs. 49.00"}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E4DE] mt-4 pt-4 flex justify-between text-[16px] font-semibold text-[#1A1A1A]">
                    <span>Total</span>
                    <span>
                      Rs.{" "}
                        {(totalPrice + (totalPrice >= 1950 ? 0 : 49)).toLocaleString(
                        "en-IN"
                      )}
                      .00
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isRedirecting}
                    className="mt-6 w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4A3C31] transition-colors disabled:opacity-70"
                  >
                    {isRedirecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>

                  <a
                    href="/products"
                    className="mt-3 w-full border border-[#E8E4DE] text-[#1A1A1A] py-3 rounded-sm font-medium text-[13px] text-center block hover:bg-[#F5F2ED] transition-colors"
                  >
                    Continue Shopping
                  </a>

                  {totalPrice < 1950 && (
                      <p className="mt-4 text-[12px] text-[#757575] text-center">
                        Add Rs. {(1950 - totalPrice).toLocaleString("en-IN")}.00 more for free shipping
                      </p>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-[#D4C8BE] mx-auto mb-4" />
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">Your cart is empty</h2>
              <p className="text-[14px] text-[#757575] mb-6">
                Explore our beautiful collection and find your perfect hijab.
              </p>
              <a
                href="/products"
                className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                Start Shopping
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
