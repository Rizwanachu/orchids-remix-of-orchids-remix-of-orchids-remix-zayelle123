"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { RefreshCw, Package, AlertCircle, CheckCircle } from "lucide-react";

export default function ReturnsExchangePage() {
  const [cmsContent, setCmsContent] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    fetch("/api/page-contents/returns-exchange")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && data.content) setCmsContent(data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              {cmsContent?.title || "Returns & Exchange"}
            </h1>
            <p className="text-[16px] text-[#757575]">
              Your satisfaction matters to us. Here&apos;s our hassle-free return policy.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto">
          {cmsContent ? (
            <div
              className="prose prose-neutral max-w-none prose-headings:font-serif prose-headings:text-[#1A1A1A] prose-p:text-[#5C4B3D] prose-p:leading-relaxed prose-a:text-[#5C4B3D] prose-a:underline prose-a:underline-offset-4 prose-li:text-[#5C4B3D] prose-strong:text-[#1A1A1A]"
              dangerouslySetInnerHTML={{ __html: cmsContent.content }}
            />
          ) : (
            <>
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
              <p>Easy returns within 7 days of delivery. Product must be unused and in original packaging and need an unpacking video clearly showing the product is damaged.</p>
              <p className="mt-2 font-medium text-[#1A1A1A]">Important: If you don&apos;t have an unpacking video and damaged products, we can&apos;t do the returns.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">How to Initiate a Return</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Record an unpacking video clearly showing the product condition at the time of delivery.</li>
                <li>Email us at <a href="mailto:zayelle.in@gmail.com" className="underline underline-offset-4">zayelle.in@gmail.com</a> with your order number, reason for return, and the unpacking video.</li>
                <li>Our team will review your request and provide return instructions within 24 hours.</li>
                <li>Ship the item back to us in its original packaging with all tags attached.</li>
                <li>Once we receive and inspect the item, your refund will be processed within 5-7 business days.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Exchange Policy</h2>
              <p>We offer exchanges for a different color or style of equal value, subject to stock availability. Exchange requests follow the same process as returns. If the desired item is out of stock, a full refund will be issued.</p>
            </section>

            <section>
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Non-Returnable Items</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Items that have been worn, washed, or altered</li>
                <li>Items without original tags and packaging</li>
                <li>Sale or discounted items (unless defective)</li>
                <li>Hijab pins and accessories (hygiene reasons)</li>
                <li>Returns without an unpacking video showing the damage</li>
              </ul>
            </section>
          </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
