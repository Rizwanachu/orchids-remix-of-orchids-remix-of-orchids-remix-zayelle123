import React from "react";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-12 md:py-20">
          <div className="container px-4 md:px-8 max-w-[800px] mx-auto text-center">
            <h1 className="text-[36px] md:text-[48px] font-serif text-[#1A1A1A] tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-[16px] text-[#757575]">
              Last updated: February 2026
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-20 max-w-[800px] mx-auto space-y-8 text-[15px] text-[#5C4B3D] leading-relaxed">
          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Introduction</h2>
            <p>At Zayelle (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website zayelle.in and make purchases from us.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing information when you create an account or place an order.</li>
              <li><strong>Payment Information:</strong> Payment details are processed securely through our payment partners. We do not store your credit/debit card information.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and browsing patterns.</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers for security and analytics purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and account</li>
              <li>To send promotional emails and updates (with your consent)</li>
              <li>To improve our website and customer experience</li>
              <li>To prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website, conducting business, or serving you (e.g., shipping partners, payment processors).</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Cookies</h2>
            <p>Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, though some features may not function properly.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. All data transmissions are encrypted using SSL technology. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at <a href="mailto:support@zayelle.in" className="underline underline-offset-4">support@zayelle.in</a>.</p>
          </section>

          <section>
            <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-3">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:support@zayelle.in" className="underline underline-offset-4">support@zayelle.in</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
