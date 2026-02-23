"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Search, Package, Truck, CheckCircle, BoxIcon, Loader2 } from "lucide-react";

const STEPS = ["processing", "confirmed", "packed", "shipped", "delivered"] as const;
const STEP_LABELS = ["Confirmed", "Packed", "Shipped", "Delivered"];
const STEP_ICONS = [CheckCircle, BoxIcon, Truck, CheckCircle];

interface TrackedOrder {
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  createdAt: string;
  items: { name: string; quantity: number; price: number; image: string }[];
}

function getStepIndex(status: string): number {
  switch (status) {
    case "processing":
    case "confirmed":
      return 0;
    case "packed":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "processing":
      return "Your order is being processed and will be confirmed shortly.";
    case "confirmed":
      return "Your order has been confirmed and is being prepared.";
    case "packed":
      return "Your order has been packed and is ready for dispatch.";
    case "shipped":
      return "Your order is on its way! It will be delivered soon.";
    case "delivered":
      return "Your order has been delivered. Thank you for shopping with us!";
    case "cancelled":
      return "This order has been cancelled.";
    default:
      return "";
  }
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundOrder, setFoundOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    const emailParam = searchParams.get("email");
    if (orderParam) setOrderId(orderParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setFoundOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setFoundOrder(data);
        setSubmitted(true);
      } else {
        setNotFound(true);
        setSubmitted(true);
      }
    } catch {
      setNotFound(true);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const activeStep = foundOrder ? getStepIndex(foundOrder.status) : -1;
  const isCancelled = foundOrder?.status === "cancelled";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Track Your Order
            </h1>
            <p className="text-[16px] text-[#757575]">
              Enter your order details below to check the status of your delivery.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[600px] mx-auto">
          {!submitted || notFound ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="e.g. ZAY-10001"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {loading ? "Searching..." : "Track Order"}
                </button>
              </form>
              {notFound && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-[8px] text-center">
                  <p className="text-[14px] text-red-600">
                    No order found with number <strong>{orderId}</strong>. Please check the order number and email, then try again.
                  </p>
                </div>
              )}
            </>
          ) : foundOrder ? (
            <div className="text-center">
              <div className="mb-8">
                <p className="text-[14px] text-[#757575] mb-1">Order Number</p>
                <p className="text-[18px] font-semibold text-[#1A1A1A]">{foundOrder.orderId}</p>
                <p className="text-[12px] text-[#757575] mt-1">
                  Placed on {new Date(foundOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {isCancelled ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-[12px] mb-8">
                  <p className="text-[14px] text-red-600 font-medium">This order has been cancelled.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 md:gap-8 mb-10">
                  {STEP_LABELS.map((step, i) => {
                    const Icon = STEP_ICONS[i];
                    const isActive = i <= activeStep;
                    const isConnectorActive = i <= activeStep - 1;
                    return (
                      <div key={step} className="flex items-center">
                        <div className={`flex flex-col items-center ${isActive ? "text-[#5C4B3D]" : "text-[#D4C8BE]"}`}>
                          <Icon size={24} />
                          <span className="text-[11px] mt-1 font-medium">{step}</span>
                        </div>
                        {i < 3 && (
                          <div className={`w-8 md:w-16 h-[2px] mx-1 md:mx-2 ${isConnectorActive ? "bg-[#5C4B3D]" : "bg-[#E8E4DE]"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-6 bg-[#F5F2ED] rounded-[12px] text-left space-y-3">
                <p className="text-[14px] text-[#5C4B3D]">
                  <strong>Status:</strong> {getStatusText(foundOrder.status)}
                </p>
                {foundOrder.trackingNumber && (
                  <p className="text-[14px] text-[#5C4B3D]">
                    <strong>Tracking Number:</strong> {foundOrder.trackingNumber}
                    {foundOrder.trackingCarrier && ` (${foundOrder.trackingCarrier})`}
                  </p>
                )}
                {foundOrder.status !== "delivered" && foundOrder.status !== "cancelled" && (
                  <p className="text-[14px] text-[#5C4B3D]">
                    <strong>Estimated Delivery:</strong> 5-7 business days from dispatch.
                  </p>
                )}
                <p className="text-[14px] text-[#5C4B3D]">
                  <strong>Payment:</strong> {foundOrder.paymentMethod || "N/A"} — {foundOrder.paymentStatus}
                </p>
                <p className="text-[14px] text-[#5C4B3D]">
                  <strong>Total:</strong> ₹{parseFloat(foundOrder.totalAmount).toLocaleString("en-IN")}.00
                </p>
              </div>

              {foundOrder.items.length > 0 && (
                <div className="mt-8 text-left">
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {foundOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-[#E8E4DE] rounded-[8px]">
                        <div className="w-12 h-12 rounded-[6px] bg-[#F5F2ED] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-[#5C4B3D]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">{item.name}</p>
                          <p className="text-[12px] text-[#757575]">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[13px] font-semibold text-[#1A1A1A]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setSubmitted(false); setFoundOrder(null); setOrderId(""); setEmail(""); setNotFound(false); }}
                className="mt-6 text-[13px] text-[#5C4B3D] underline underline-offset-4 hover:text-[#1A1A1A] transition-colors"
              >
                Track another order
              </button>
            </div>
          ) : null}

          <div className="mt-12 text-center p-6 bg-[#F5F2ED] rounded-[12px]">
            <p className="text-[14px] text-[#5C4B3D]">
              Need help with your order? <a href="/pages/contact" className="underline underline-offset-4 font-medium hover:text-[#1A1A1A]">Contact us</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}
