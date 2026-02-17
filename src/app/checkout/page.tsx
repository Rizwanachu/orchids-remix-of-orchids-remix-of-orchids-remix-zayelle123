"use client";

import React, { useState } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/orders-context";
import { CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  const shipping = totalPrice >= 1950 ? 0 : 49;
  const total = totalPrice + shipping;

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    form.email && form.firstName && form.lastName && form.address && form.city && form.state && form.pincode && form.phone && items.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      const orderEmail = user?.email || form.email;
      const order = addOrder({
        userEmail: orderEmail,
        status: "Confirmed",
        total,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      });
      setPlacedOrderId(order.id);
      setPlaced(true);
      clearCart();
    };

  if (placed) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <CheckCircle size={56} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-[28px] font-serif text-[#1A1A1A] mb-2">Order Confirmed!</h1>
              <p className="text-[14px] text-[#757575] mb-2">
                Thank you for your order. We&apos;ll send a confirmation email shortly.
              </p>
              <p className="text-[14px] text-[#757575] mb-1">
                Order Number: <span className="font-semibold text-[#1A1A1A]">{placedOrderId}</span>
              </p>
              <p className="text-[14px] text-[#757575] mb-8">
                Order Total: <span className="font-semibold text-[#1A1A1A]">Rs. {total.toLocaleString("en-IN")}.00</span>
              </p>
            <a
              href="/"
              className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Checkout
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/cart" className="hover:text-[#1A1A1A] transition-colors">Cart</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {items.length === 0 && !placed ? (
            <div className="text-center py-16">
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">Your cart is empty</h2>
              <p className="text-[14px] text-[#757575] mb-6">Add some items before checking out.</p>
              <a href="/products" className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors">
                Browse Products
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Contact */}
                  <div>
                    <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Contact Information</h2>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                      required
                    />
                  </div>

                  {/* Shipping */}
                  <div>
                    <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Shipping Address</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="First name"
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white sm:col-span-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={form.pincode}
                        onChange={(e) => update("pincode", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment note */}
                  <div>
                    <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Payment</h2>
                    <div className="bg-white border border-[#E8E4DE] rounded-sm p-4">
                      <p className="text-[14px] text-[#555]">
                        Cash on Delivery (COD) available for all orders within India.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed lg:hidden"
                  >
                    Place Order — Rs. {total.toLocaleString("en-IN")}.00
                  </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-[12px] p-6 border border-[#E8E4DE] sticky top-8">
                    <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-6">
                      Order Summary ({items.length})
                    </h2>

                    <div className="space-y-4 max-h-[320px] overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-14 h-14 rounded-[6px] overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                            <span className="absolute -top-1 -right-1 bg-[#5C4B3D] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">{item.name}</p>
                            <p className="text-[12px] text-[#757575]">{item.subtitle}</p>
                          </div>
                          <span className="text-[13px] font-medium text-[#1A1A1A] flex-shrink-0">
                            Rs. {(item.price * item.quantity).toLocaleString("en-IN")}.00
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#E8E4DE] mt-4 pt-4 space-y-2 text-[14px]">
                      <div className="flex justify-between text-[#555]">
                        <span>Subtotal</span>
                        <span>Rs. {totalPrice.toLocaleString("en-IN")}.00</span>
                      </div>
                      <div className="flex justify-between text-[#555]">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "Free" : `Rs. ${shipping}.00`}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#E8E4DE] mt-3 pt-3 flex justify-between text-[16px] font-semibold text-[#1A1A1A]">
                      <span>Total</span>
                      <span>Rs. {total.toLocaleString("en-IN")}.00</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="hidden lg:flex mt-6 w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider items-center justify-center hover:bg-[#4A3C31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
