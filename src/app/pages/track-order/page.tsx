"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Search, Package, Truck, CheckCircle, BoxIcon } from "lucide-react";
import { useOrders, Order } from "@/lib/orders-context";

const STEPS = ["Confirmed", "Packed", "Shipped", "Delivered"] as const;
const STEP_ICONS = [CheckCircle, BoxIcon, Truck, CheckCircle];

function getStepIndex(status: Order["status"]): number {
  return STEPS.indexOf(status);
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { getOrderById } = useOrders();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderId(orderParam);
      const order = getOrderById(orderParam);
      if (order) {
        setFoundOrder(order);
        setSubmitted(true);
      }
    }
  }, [searchParams, getOrderById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = getOrderById(orderId);
    if (order) {
      setFoundOrder(order);
      setNotFound(false);
      setSubmitted(true);
    } else {
      setFoundOrder(null);
      setNotFound(true);
      setSubmitted(true);
    }
  };

  const activeStep = foundOrder ? getStepIndex(foundOrder.status) : -1;

  const statusText = foundOrder
    ? foundOrder.status === "Confirmed"
      ? "Your order has been confirmed and is being prepared."
      : foundOrder.status === "Packed"
      ? "Your order has been packed and is ready for dispatch."
      : foundOrder.status === "Shipped"
      ? "Your order is on its way! It will be delivered soon."
      : "Your order has been delivered. Thank you for shopping with us!"
    : "";

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
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
                >
                  <Search size={14} />
                  Track Order
                </button>
              </form>
              {notFound && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-[8px] text-center">
                  <p className="text-[14px] text-red-600">
                    No order found with number <strong>{orderId}</strong>. Please check the order number and try again.
                  </p>
                </div>
              )}
            </>
          ) : foundOrder ? (
            <div className="text-center">
              <div className="mb-8">
                <p className="text-[14px] text-[#757575] mb-1">Order Number</p>
                <p className="text-[18px] font-semibold text-[#1A1A1A]">{foundOrder.id}</p>
              </div>

              <div className="flex items-center justify-center gap-2 md:gap-8 mb-10">
                {STEPS.map((step, i) => {
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

              <div className="p-6 bg-[#F5F2ED] rounded-[12px] text-left space-y-3">
                <p className="text-[14px] text-[#5C4B3D]">
                  <strong>Status:</strong> {statusText}
                </p>
                {foundOrder.status !== "Delivered" && (
                  <p className="text-[14px] text-[#5C4B3D]">
                    <strong>Estimated Delivery:</strong> 5-7 business days from dispatch.
                  </p>
                )}
                {foundOrder.status === "Delivered" && (
                  <p className="text-[14px] text-[#5C4B3D]">
                    <strong>Delivered on:</strong> Your order was successfully delivered.
                  </p>
                )}
                <p className="text-[13px] text-[#757575]">
                  You will receive tracking updates via email and SMS.
                </p>
              </div>

              {/* Order items */}
              <div className="mt-8 text-left">
                <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Order Items</h3>
                <div className="space-y-3">
                  {foundOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-[#E8E4DE] rounded-[8px]">
                      <div className="w-12 h-12 rounded-[6px] bg-[#F5F2ED] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Package size={16} className="text-[#5C4B3D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">{item.name}</p>
                        <p className="text-[12px] text-[#757575]">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A]">
                        Rs. {(item.price * item.quantity).toLocaleString("en-IN")}.00
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
