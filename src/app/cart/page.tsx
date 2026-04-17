"use client";

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useCart, getItemTotal } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const incompleteBundle = items.find((item) => {
    if (!item.bundleType) return false;
    const m = String(item.bundleType).match(/(\d+)/);
    const need = m ? parseInt(m[1], 10) : 0;
    if (!need) return true;
    const sum = (item.colorSelections || []).reduce((s, c) => s + (Number(c.quantity) || 0), 0);
    return sum !== need;
  });

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (incompleteBundle) {
      alert(`"${incompleteBundle.name}" is a bundle of ${String(incompleteBundle.bundleType).match(/(\d+)/)?.[1] || "?"} but only ${(incompleteBundle.colorSelections || []).reduce((s, c) => s + (Number(c.quantity) || 0), 0)} colors are picked. Please update the colors before checking out.`);
      return;
    }
    window.location.href = "/checkout";
  };

  const hasFreeShippingProduct = items.some(item => (item as any).isFreeShipping);
  const effectiveTotalPrice = (totalPrice + (totalPrice >= 1000 || hasFreeShippingProduct ? 0 : 49));

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
                        <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" sizes="80px" />
                      </a>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                          <a href={`/products/${item.handle}`} className="hover:text-[#5C4B3D] transition-colors">
                            {item.name}
                          </a>
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">{item.subtitle}</p>
                        {item.colorSelections && item.colorSelections.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.colorSelections.map((cs, ci) => (
                              <span key={ci} className="inline-flex items-center gap-1 text-[11px] text-[#555] bg-[#F5F2ED] rounded-full px-2 py-0.5">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: cs.hex }} />
                                {cs.quantity}× {cs.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[13px] text-[#1A1A1A] font-medium md:hidden mt-1 block">
                          Rs. {item.price.toLocaleString("en-IN")}.00
                        </span>
                        {(item as any).isFreeShipping && (
                          <span className="text-[11px] text-green-600 font-medium mt-1 block">Free Shipping</span>
                        )}
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
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-[15px] font-semibold text-[#1A1A1A]">
                        Rs. {getItemTotal(item).toLocaleString("en-IN")}.00
                      </span>
                      {(() => {
                        const normal = item.price * item.quantity;
                        const bundle = getItemTotal(item);
                        return normal > bundle ? (
                          <span className="text-[11px] text-[#991B1B] mt-0.5">Save ₹{(normal - bundle).toLocaleString("en-IN")}</span>
                        ) : null;
                      })()}
                    </div>

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
                      <span>{totalPrice >= 1000 || hasFreeShippingProduct ? "Free" : "Rs. 49.00"}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E4DE] mt-4 pt-4 flex justify-between text-[16px] font-semibold text-[#1A1A1A]">
                    <span>Total</span>
                    <span>
                      Rs.{" "}
                        {effectiveTotalPrice.toLocaleString(
                        "en-IN"
                      )}
                      .00
                    </span>
                  </div>

                  {incompleteBundle && (
                    <div className="mt-4 text-[12px] text-[#991B1B] bg-[#FBEAE9] border border-[#F1C7C2] rounded px-3 py-2">
                      "{incompleteBundle.name}" needs {String(incompleteBundle.bundleType).match(/(\d+)/)?.[1] || "?"} colors picked. Open the product to complete the bundle.
                    </div>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={isRedirecting || !!incompleteBundle}
                    className="mt-6 w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4A3C31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {totalPrice < 1000 && (
                      <p className="mt-4 text-[12px] text-[#757575] text-center">
                        Add Rs. {(1000 - totalPrice).toLocaleString("en-IN")}.00 more for free shipping
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
