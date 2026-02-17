"use client";

import React, { useState } from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Mail, Phone, Clock, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#757575] leading-relaxed">
              We&apos;d love to hear from you. Reach out anytime.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-[24px] font-serif text-[#1A1A1A] mb-8">Get in Touch</h2>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "support@zayelle.in", href: "mailto:support@zayelle.in" },
                  { icon: Phone, label: "WhatsApp", value: "+91 XXXXX XXXXX", href: "https://wa.me/" },
                  { icon: Clock, label: "Working Hours", value: "Mon - Sat | 10 AM - 6 PM", href: null },
                  { icon: MapPin, label: "Location", value: "India", href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-[#5C4B3D]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-wider text-[#757575] mb-1">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-[15px] text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[15px] text-[#1A1A1A]">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-[#F5F2ED] rounded-[12px]">
                <p className="text-[14px] text-[#5C4B3D] leading-relaxed">
                  For order-related inquiries, please include your order number in the message so we can assist you faster.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-[24px] font-serif text-[#1A1A1A] mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white resize-none"
                    placeholder="Your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
                >
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
