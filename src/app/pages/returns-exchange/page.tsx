import React from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { RefreshCw, Package, AlertCircle, CheckCircle } from "lucide-react";

export default function ReturnsExchangePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Returns & Exchange
            </h1>
            <p className="text-[16px] text-[#757575]">
              Your satisfaction matters to us. Here&apos;s our hassle-free return policy.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: RefreshCw, label: "7-Day Returns", sub: "Easy process" },
              { icon: Package, label: "Free Exchange", sub: "Subject to stock" },
              { icon: AlertCircle, label: "Conditions Apply", sub: "Unused & tagged" },
              { icon: CheckCircle, label: "Quick Refunds", sub: "5-7 business days" },
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
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Return Policy</h2>
              <p>We accept returns within 7 days of delivery. To be eligible for a return, the item must be unused, unwashed, and in its original packaging with all tags attached.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">How to Initiate a Return</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Email us at <a href="mailto:support@zayelle.in" className="underline underline-offset-4">support@zayelle.in</a> with your order number and reason for return.</li>
                <li>Our team will review your request and provide return instructions within 24 hours.</li>
                <li>Ship the item back to us using a prepaid label (provided for eligible returns).</li>
                <li>Once we receive and inspect the item, your refund will be processed.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Exchange Policy</h2>
              <p>We offer exchanges for a different color or style of equal value, subject to stock availability. Exchange requests follow the same process as returns. If the desired item is out of stock, a full refund will be issued.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Refund Timeline</h2>
              <p>Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method. For COD orders, refunds will be processed via bank transfer.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Non-Returnable Items</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Items that have been worn, washed, or altered</li>
                <li>Items without original tags and packaging</li>
                <li>Sale or discounted items (unless defective)</li>
                <li>Hijab pins and accessories (hygiene reasons)</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
