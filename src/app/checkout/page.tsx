"use client";

import React, { useState, Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/products-context";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { items: cartItems, totalPrice: cartTotalPrice } = useCart();
  const searchParams = useSearchParams();
  const { getProductByHandle, products } = useProducts();
  
  const isDirect = searchParams.get("direct") === "true";
  const productId = searchParams.get("id");
  const productQuantity = parseInt(searchParams.get("quantity") || "1", 10);
  
  // Find product if direct checkout
  const directProduct = productId ? products.find(p => p.id === productId) : null;
  
  const items = isDirect && directProduct 
    ? [{ ...directProduct, quantity: productQuantity }]
    : cartItems;
    
  const totalPrice = isDirect && directProduct
    ? directProduct.price * productQuantity
    : cartTotalPrice;

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("This is a demo checkout page. In a real application, this would process your payment.");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some items to your cart to checkout.</p>
          <Link
            href="/"
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Form */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black mb-4"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP code"
                  className="w-full px-4 py-3 rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <div className="border border-black p-4 rounded-md flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Credit Card</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-zinc-200 rounded"></div>
                  <div className="w-8 h-5 bg-zinc-200 rounded"></div>
                  <div className="w-8 h-5 bg-zinc-200 rounded"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                All transactions are secure and encrypted.
              </p>
            </section>

            <button
              onClick={handleSubmit}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group"
            >
              Complete Purchase
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit bg-white p-6 lg:p-8 rounded-2xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-6 mb-8 max-h-[400px] overflow-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-24 flex-shrink-0 bg-zinc-100 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-zinc-800 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow py-1">
                    <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
                    <p className="text-sm font-semibold mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-zinc-100 pt-3 mt-3">
                <span>Total</span>
                <span>USD ${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-zinc-400" />
                <span>Secure SSL encrypted checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-zinc-400" />
                <span>Free express shipping worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
