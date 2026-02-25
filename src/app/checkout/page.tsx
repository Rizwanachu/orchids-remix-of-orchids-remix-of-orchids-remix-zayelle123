"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, Loader2, CheckCircle, Package, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/products-context";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart } = useCart();
  const searchParams = useSearchParams();
  const { products } = useProducts();

  const isDirect = searchParams.get("direct") === "true";
  const productId = searchParams.get("id");
  const productQuantity = parseInt(searchParams.get("quantity") || "1", 10);

  const directProduct = productId ? products.find(p => p.id === productId) : null;

  const items = isDirect && directProduct
    ? [{ ...directProduct, quantity: productQuantity }]
    : cartItems;

  const subtotal = isDirect && directProduct
    ? (directProduct.price || 0) * productQuantity
    : cartTotalPrice;

  const maxShipping = items.reduce((max, item: any) => {
    if (item.isFreeShipping) return 0;
    const itemShipping = item.shippingCost != null ? Number(item.shippingCost) : 49;
    return Math.max(max, itemShipping);
  }, 0);

  const shippingCost = subtotal >= 1950 ? 0 : maxShipping;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "online",
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon({ code: data.coupon.code, discount: data.coupon.discountAmount });
        alert("Coupon applied successfully!");
      } else {
        alert(data.error || "Invalid coupon");
      }
    } catch (err) {
      alert("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const codFee = formData.paymentMethod === "cod" ? 50 : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPrice = subtotal + shippingCost + codFee - discountAmount;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ orderId: string } | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/razorpay/config")
      .then((res) => res.json())
      .then((data) => setRazorpayKeyId(data.keyId || ""))
      .catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ""))) errs.phone = "Invalid 10-digit phone number";
    if (!formData.address.trim()) errs.address = "Address is required";
    if (!formData.city.trim()) errs.city = "City is required";
    if (!formData.state.trim()) errs.state = "State is required";
    if (!formData.pincode.trim()) errs.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(formData.pincode)) errs.pincode = "Invalid 6-digit PIN code";
    return errs;
  };

  const getOrderData = () => {
    const customerName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
    const orderItemsList = items.map((item) => ({
      productName: item.name,
      productHandle: item.handle,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));
    return { customerName, shippingAddress, orderItems: orderItemsList };
  };

  const handleCODOrder = async () => {
    const { customerName, shippingAddress, orderItems } = getOrderData();
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail: formData.email.trim().toLowerCase(),
        customerPhone: formData.phone.trim(),
        shippingAddress,
        items: orderItems,
        paymentMethod: "Cash on Delivery",
        totalAmount: totalPrice,
        couponCode: appliedCoupon?.code,
        discountAmount: discountAmount,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setOrderPlaced({ orderId: data.order.orderId });
      if (!isDirect) clearCart();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to place order. Please try again.");
    }
  };

  const handleRazorpayOrder = async () => {
    if (!razorpayKeyId || !razorpayLoaded) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    const createRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: totalPrice,
        receipt: `zay_${Date.now()}`,
      }),
    });

    if (!createRes.ok) {
      alert("Failed to initiate payment. Please try again.");
      return;
    }

    const razorpayOrder = await createRes.json();
    const { customerName, shippingAddress, orderItems } = getOrderData();

    const options = {
      key: razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Zayelle",
      description: "Order Payment",
      order_id: razorpayOrder.id,
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerName,
              customerEmail: formData.email.trim().toLowerCase(),
              customerPhone: formData.phone.trim(),
              shippingAddress,
              items: orderItems,
              totalAmount: totalPrice,
              couponCode: appliedCoupon?.code,
              discountAmount: discountAmount,
            }),
          });

          if (verifyRes.ok) {
            const data = await verifyRes.json();
            setOrderPlaced({ orderId: data.order.orderId });
            if (!isDirect) clearCart();
          } else {
            alert("Payment was received but order creation failed. Please contact support.");
          }
        } catch {
          alert("Payment was received but order creation failed. Please contact support.");
        } finally {
          setSubmitting(false);
        }
      },
      prefill: {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        contact: formData.phone.trim(),
      },
      theme: {
        color: "#5C4B3D",
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      await handleRazorpayOrder();
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-[28px] font-serif text-[#1A1A1A] mb-2">Order Placed Successfully!</h1>
            <p className="text-[14px] text-[#757575] mb-6">
              Thank you for your order. Your order ID is{" "}
              <span className="font-semibold text-[#5C4B3D]">{orderPlaced.orderId}</span>
            </p>
            <div className="bg-white rounded-[12px] border border-[#E8E4DE] p-5 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Package size={18} className="text-[#5C4B3D]" />
                <span className="text-[14px] font-medium text-[#1A1A1A]">What's next?</span>
              </div>
              <ul className="space-y-2 text-[13px] text-[#555]">
                <li>• You will receive an order confirmation email shortly</li>
                <li>• We will notify you when your order is shipped</li>
                <li>• Expected delivery: 5-7 business days</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="flex-1 bg-[#5C4B3D] text-white py-3 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors text-center"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="flex-1 border border-[#E8E4DE] text-[#1A1A1A] py-3 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#F5F2ED] transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isDirect && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <ShoppingBag size={48} className="text-[#D4C8BE] mb-4" />
          <h1 className="text-[24px] font-serif text-[#1A1A1A] mb-2">Your cart is empty</h1>
          <p className="text-[14px] text-[#757575] mb-6">Add some items to your cart to checkout.</p>
          <Link
            href="/products"
            className="bg-[#5C4B3D] text-white px-8 py-3 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 border rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors ${
      errors[field] ? "border-red-300 bg-red-50/50" : "border-[#E8E4DE] bg-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      <Header />
      <main className="flex-grow">
        <div className="bg-[#F5F2ED] py-8 md:py-10">
          <div className="container px-4 md:px-8">
            <h1 className="text-[28px] md:text-[36px] font-serif text-[#1A1A1A] tracking-tight">Checkout</h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
              <span className="mx-2">&gt;</span>
              <Link href="/cart" className="hover:text-[#1A1A1A] transition-colors">Cart</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-10 md:py-14">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
              <section>
                <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      className={inputClass("email")}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone number (10 digits)"
                      className={inputClass("phone")}
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {errors.phone && <p className="text-[12px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        className={inputClass("firstName")}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                      {errors.firstName && <p className="text-[12px] text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        className={inputClass("lastName")}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                      {errors.lastName && <p className="text-[12px] text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Full address (House no, Street, Area)"
                      className={inputClass("address")}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {errors.address && <p className="text-[12px] text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        className={inputClass("city")}
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                      {errors.city && <p className="text-[12px] text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <select
                        name="state"
                        className={inputClass("state")}
                        value={formData.state}
                        onChange={handleInputChange}
                      >
                        <option value="">State</option>
                        {[
                          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                          "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                          "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                          "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                          "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                          "Uttar Pradesh", "Uttarakhand", "West Bengal",
                          "Chandigarh", "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
                        ].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-[12px] text-red-500 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="PIN Code"
                        maxLength={6}
                        className={inputClass("pincode")}
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                      {errors.pincode && <p className="text-[12px] text-red-500 mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors border-[#5C4B3D] bg-[#5C4B3D]/5`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={true}
                      readOnly
                      className="w-4 h-4 accent-[#5C4B3D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#1A1A1A]">Pay Online</span>
                        <CreditCard size={16} className="text-[#5C4B3D]" />
                      </div>
                      <p className="text-[12px] text-[#757575] mt-0.5">UPI, Cards, Net Banking, Wallets (powered by Razorpay)</p>
                    </div>
                  </label>
                </div>
              </section>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5C4B3D] text-white py-4 rounded-sm font-medium text-[14px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {formData.paymentMethod === "online" ? "Processing Payment..." : "Placing Order..."}
                  </>
                ) : (
                  <>
                    {formData.paymentMethod === "online" ? "Pay" : "Place Order"} — ₹{totalPrice.toLocaleString("en-IN")}.00
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-[#999] text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-[12px] border border-[#E8E4DE] p-6 sticky top-8">
                <h2 className="text-[18px] font-serif text-[#1A1A1A] mb-5">Order Summary</h2>
                <div className="space-y-4 mb-6 max-h-[350px] overflow-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-[#F5F2ED] rounded-[8px] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <span className="absolute -top-1 -right-1 bg-[#5C4B3D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0 py-0.5">
                        <h3 className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">{item.name}</h3>
                        <p className="text-[11px] text-[#757575] mt-0.5">{item.subtitle}</p>
                        <p className="text-[13px] font-semibold text-[#1A1A1A] mt-1">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}.00
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 border-t border-[#E8E4DE] pt-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#757575]">Subtotal</span>
                    <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString("en-IN")}.00</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[13px] text-green-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discount.toLocaleString("en-IN")}.00</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#757575]">Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-medium" : "text-[#1A1A1A]"}>
                      {shippingCost === 0 ? "Free" : `₹${shippingCost}.00`}
                    </span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#757575]">COD Charges</span>
                      <span className="text-[#1A1A1A]">₹{codFee}.00</span>
                    </div>
                  )}
                  <div className="border-t border-[#E8E4DE] mt-2 pt-3 flex justify-between">
                    <span className="text-[15px] font-bold text-[#1A1A1A]">Total</span>
                    <span className="text-[17px] font-bold text-[#5C4B3D]">₹{totalPrice.toLocaleString("en-IN")}.00</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#E8E4DE] pt-6">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Discount code"
                        className="w-full px-3 py-2 border border-[#E8E4DE] rounded text-[13px] focus:outline-none focus:border-[#5C4B3D] disabled:bg-gray-50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-red-600 hover:text-red-700 underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim() || !!appliedCoupon}
                      className="px-4 py-2 bg-[#5C4B3D] text-white rounded text-[12px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                </div>

                {subtotal < 1950 && (
                  <p className="mt-4 text-[12px] text-[#757575] text-center bg-[#F5F2ED] py-2 rounded">
                    Add ₹{(1950 - subtotal).toLocaleString("en-IN")}.00 more for free shipping
                  </p>
                )}

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 text-[12px] text-[#757575]">
                    <ShieldCheck size={16} className="text-[#5C4B3D] flex-shrink-0" />
                    <span>Secure & encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#757575]">
                    <Truck size={16} className="text-[#5C4B3D] flex-shrink-0" />
                    <span>Fast delivery across India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
