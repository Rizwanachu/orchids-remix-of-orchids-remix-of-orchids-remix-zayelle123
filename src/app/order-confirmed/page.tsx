"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { CheckCircle, Package, Loader2 } from "lucide-react";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

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
            Thank you for your order.{" "}
            {orderId && (
              <>
                Your order ID is{" "}
                <span className="font-semibold text-[#5C4B3D]">{orderId}</span>
              </>
            )}
          </p>
          <div className="bg-white rounded-[12px] border border-[#E8E4DE] p-5 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <Package size={18} className="text-[#5C4B3D]" />
              <span className="text-[14px] font-medium text-[#1A1A1A]">What&apos;s next?</span>
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

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}
