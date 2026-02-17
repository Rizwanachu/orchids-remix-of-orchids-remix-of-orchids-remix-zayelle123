"use client";

import React, { useState } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does delivery take?", a: "We deliver across India within 5-7 business days. Metro cities may receive orders sooner, typically within 3-5 business days." },
      { q: "Do you offer free shipping?", a: "Yes! We offer free shipping on all orders above Rs. 1,950. Orders below Rs. 1,950 have a flat shipping charge of Rs. 49." },
      { q: "Can I track my order?", a: "Absolutely! Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order from the 'Track Your Order' page." },
      { q: "Do you ship internationally?", a: "Currently, we only ship within India. International shipping is coming soon!" },
    ],
  },
  {
    category: "Returns & Exchange",
    items: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery. Items must be unused, unwashed, and in their original packaging with tags attached." },
      { q: "How do I initiate a return?", a: "Simply email us at support@zayelle.in with your order number and reason for return. Our team will guide you through the process." },
      { q: "Can I exchange for a different color?", a: "Yes, exchanges are available for a different color or style of equal value, subject to stock availability." },
      { q: "How long do refunds take?", a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "What fabrics do you use?", a: "We use premium fabrics including chiffon, satin silk, premium jersey, modal, and linen. Each fabric is carefully selected for quality, drape, and comfort." },
      { q: "How do I care for my hijab?", a: "We recommend hand washing in cold water with mild detergent. Avoid wringing — gently squeeze out excess water and lay flat to dry. Iron on low heat if needed." },
      { q: "What size are your hijabs?", a: "Our standard hijabs are approximately 175cm x 75cm, providing generous coverage for various styling options. Specific measurements are listed on each product page." },
    ],
  },
  {
    category: "Account & Payment",
    items: [
      { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, net banking, and cash on delivery (COD) for eligible orders." },
      { q: "Do I need an account to place an order?", a: "No, you can checkout as a guest. However, creating an account allows you to track orders, save your wishlist, and enjoy a faster checkout experience." },
      { q: "Is my payment information secure?", a: "Yes, all transactions are processed through secure, encrypted payment gateways. We never store your payment details." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8E4DE]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-[15px] font-medium text-[#1A1A1A] pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-[#757575] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-[14px] text-[#757575] leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#757575] leading-relaxed">
              Find answers to common questions about our products, orders, and policies.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto">
          {faqs.map((section) => (
            <div key={section.category} className="mb-12 last:mb-0">
              <h2 className="text-[20px] md:text-[24px] font-serif text-[#1A1A1A] mb-2">{section.category}</h2>
              <div className="border-t border-[#E8E4DE]">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-12 text-center p-8 bg-[#F5F2ED] rounded-[12px]">
            <h3 className="text-[18px] font-serif text-[#1A1A1A] mb-3">Still have questions?</h3>
            <p className="text-[14px] text-[#757575] mb-5">
              Our support team is happy to help.
            </p>
            <a
              href="/pages/contact"
              className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
