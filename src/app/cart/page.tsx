"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useCart, getItemTotal } from "@/lib/cart-context";

const FREE_SHIPPING_THRESHOLD = 1000;

interface UpsellProduct {
  id: number;
  name: string;
  subtitle: string;
  customPrice: number;
  image: string;
  handle: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, addItem } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/cart-upsell")
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        setUpsellProducts(
          data.map(r => ({
            id: r.id,
            name: r.name,
            subtitle: r.subtitle || "",
            customPrice: Number(r.custom_price),
            image: r.image,
            handle: r.handle,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const handleUpsellAdd = (item: UpsellProduct) => {
    addItem({
      id: `upsell-${item.id}-${item.handle}`,
      handle: item.handle,
      name: item.name,
      subtitle: item.subtitle,
      price: item.customPrice,
      image: item.image,
    });
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(item.id); return n; }), 1500);
  };

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
  const effectiveTotalPrice = (totalPrice + (totalPrice >= FREE_SHIPPING_THRESHOLD || hasFreeShippingProduct ? 0 : 49));

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const freeShippingProgress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const hasFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD || hasFreeShippingProduct;

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

        {/* Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className={`border-b ${hasFreeShipping ? "bg-[#F0FAF4] border-[#C6E9D5]" : "bg-[#FDF9F5] border-[#E8E4DE]"}`}>
            <div className="container px-4 md:px-8 py-3.5">
              {hasFreeShipping ? (
                <p className="text-[13px] font-medium text-[#22863A] text-center">
                  🎉 You've unlocked <strong>FREE shipping</strong>!
                </p>
              ) : (
                <div>
                  <p className="text-[13px] text-[#555] mb-2 text-center">
                    Add <strong>₹{amountToFreeShipping.toLocaleString("en-IN")}</strong> more to get <strong>FREE shipping</strong>
                  </p>
                  <div className="w-full bg-[#E8E4DE] rounded-full h-1.5">
                    <div
                      className="bg-[#5C4B3D] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-0">
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

                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 flex items-center justify-center text-[#757575] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Upsell Section */}
                {upsellProducts.length > 0 && (
                  <div className="mt-8 pt-4">
                    <p className="text-[13px] font-semibold text-[#1A1A1A] uppercase tracking-wider mb-4">
                      Complete Your Order
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {upsellProducts.map((item) => (
                        <div key={item.id} className="group flex flex-col">
                          <a href={`/products/${item.handle}`} className="block relative w-full aspect-square overflow-hidden rounded-[10px] bg-[#F5F2ED] mb-2">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width:640px) 50vw, 25vw"
                            />
                          </a>
                          <a
                            href={`/products/${item.handle}`}
                            className="text-[13px] font-medium text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors leading-tight line-clamp-1"
                          >
                            {item.name}
                          </a>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[13px] font-semibold text-[#1A1A1A]">
                              ₹{item.customPrice.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => handleUpsellAdd(item)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                                addedIds.has(item.id)
                                  ? "bg-green-500 text-white scale-110"
                                  : "bg-[#5C4B3D] text-white hover:bg-[#4a3b30] hover:scale-110"
                              }`}
                              title="Add to cart"
                            >
                              {addedIds.has(item.id) ? (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ) : (
                                <Plus size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      <span className={hasFreeShipping ? "text-green-600 font-medium" : ""}>
                        {hasFreeShipping ? "Free" : "Rs. 49.00"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E4DE] mt-4 pt-4 flex justify-between text-[16px] font-semibold text-[#1A1A1A]">
                    <span>Total</span>
                    <span>Rs. {effectiveTotalPrice.toLocaleString("en-IN")}.00</span>
                  </div>

                  {!hasFreeShipping && (
                    <p className="mt-3 text-[12px] text-[#757575] text-center bg-[#FDF9F5] rounded py-2">
                      Add ₹{amountToFreeShipping.toLocaleString("en-IN")} more for <strong>free shipping</strong>
                    </p>
                  )}

                  {incompleteBundle && (
                    <div className="mt-4 text-[12px] text-[#991B1B] bg-[#FBEAE9] border border-[#F1C7C2] rounded px-3 py-2">
                      "{incompleteBundle.name}" needs {String(incompleteBundle.bundleType).match(/(\d+)/)?.[1] || "?"} colors picked. Open the product to complete the bundle.
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isRedirecting || !!incompleteBundle}
                    className="mt-5 w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#4A3C31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Checkout trust signals */}
                  <div className="mt-5 pt-4 border-t border-[#F5F2ED] grid grid-cols-2 gap-2">
                    {[
                      "Secure Checkout",
                      "Fast Shipping",
                      "Quality Checked",
                      "Easy Returns",
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#757575]">
                        <span className="text-[#5C4B3D]">✓</span>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag size={48} className="text-[#D4C8BE] mx-auto mb-4" />
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">Your cart is empty</h2>
              <p className="text-[14px] text-[#757575] mb-6">
                Explore our beautiful collection and find your perfect style.
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
