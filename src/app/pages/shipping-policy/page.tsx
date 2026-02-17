import React from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Truck, Clock, Package, MapPin } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Shipping Policy
            </h1>
            <p className="text-[16px] text-[#757575]">
              Everything you need to know about our shipping and delivery.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto">
          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Truck, label: "Free Shipping", sub: "Above Rs. 1,950" },
              { icon: Clock, label: "Delivery Time", sub: "5-7 Business Days" },
              { icon: Package, label: "Careful Packaging", sub: "Premium wrapping" },
              { icon: MapPin, label: "Pan India", sub: "All pin codes" },
            ].map((item) => (
              <div key={item.label} className="text-center p-5 bg-[#F5F2ED] rounded-[12px]">
                <item.icon size={22} className="text-[#5C4B3D] mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{item.label}</p>
                <p className="text-[12px] text-[#757575]">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8 text-[15px] text-[#5C4B3D] leading-relaxed">
            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Domestic Shipping</h2>
              <p>We ship across India through trusted courier partners. Standard delivery takes 5-7 business days from the date of dispatch. Metro cities may receive orders within 3-5 business days.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Shipping Charges</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Orders above Rs. 1,950 — <strong>Free Shipping</strong></li>
                <li>Orders below Rs. 1,950 — Flat Rs. 49 shipping charge</li>
                <li>Cash on Delivery (COD) — Additional Rs. 49 handling fee</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Order Processing</h2>
              <p>Orders are processed within 1-2 business days (excluding Sundays and public holidays). You will receive a confirmation email with tracking details once your order is shipped.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Tracking Your Order</h2>
              <p>Once dispatched, you&apos;ll receive a tracking link via email and SMS. You can also track your order anytime from our <a href="/pages/track-order" className="text-[#5C4B3D] underline underline-offset-4 hover:text-[#1A1A1A]">Track Your Order</a> page.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Delivery Issues</h2>
              <p>If your order is delayed beyond the estimated delivery time, please contact us at <a href="mailto:support@zayelle.in" className="underline underline-offset-4">support@zayelle.in</a> with your order number. We&apos;ll look into it right away.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
